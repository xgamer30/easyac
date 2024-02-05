eac.forms = { errors: {} };

eac.forms.errors.clear = function(form, options) {
  options = jQuery.extend({ errors: true }, options);
  if (options.errors) {
    form
      .find('.form-error')
      .empty()
      .hide();
  }
  return form;
};

eac.forms.errors.render = function(form, options) {
  options = jQuery.extend({ errors: {}, warnings: {} }, options);
  eac.forms.errors.clear(form);

  $.each(options.errors, function(key, values) {
    var placeholders = form.find('#' + key).siblings('.form-error');
    if (placeholders.length) {
      var placeholder = $(placeholders[0]).show();
      $.each(values, function(i, value) {
        placeholder.append('<p>' + value + '</p>');
      });
    }
  });

  return form;
};

/**
 * Handles submit events for the given form.
 * @param options
 * @returns The form on which submit events are handled.
 */
eac.forms.ajax = function(options) {
  $(options.form).submit(function(submitArgs) {
    submitArgs.preventDefault();
    submitArgs.stopImmediatePropagation();
    if (!options.submit || options.submit(submitArgs) !== false) {
      eac.ajax({
        loadTarget: $(this).find('.form-actions'),
        type: submitArgs.target.method,
        url: submitArgs.target.action,
        data: $(submitArgs.target).serialize(),
        beforeSend: function() {
          if(options.beforeSend) {
            options.beforeSend()
          }
        },
        success: function(result) {
          var form = eac.forms.errors.clear($(submitArgs.target));
          if (result.success && !result.errors && !result.warnings) {
            form.find('input, textarea, select').prop('disabled', true);
            form.find('.form-success').show();
            options.success(result);
          } else {
            eac.forms.errors.render(form, {
              errors: result.errors,
              warnings: result.warnings
            });
            if (result.error) {
              //alert(result.error);
            }

            if (options.error) {
              options.error(result);
            }
          }
        }
      });
    }
    return false;
  });

  return $(options.form);
};

/**
 * Allows for dynamically showing and hiding a form, and handling the submits in ajax style.
 * @param options
 */
eac.forms.dynamic = function(options) {
  var form = $(options.form);
  $(options.trigger).click(function(clickArgs) {
    clickArgs.preventDefault();
    eac.forms.errors.clear(form);
    form.show();
    if (options.triggered) {
      options.triggered(form);
    }
  });

  form.find('.cancel').click(function(clickArgs) {
    clickArgs.preventDefault();
    form.hide();
    if (options.canceled) {
      options.canceled();
    }
  });

  eac.forms.ajax({
    form: form,
    error: options.submit.error,
    success: function(result) {
      form
        .hide()
        .find('input')
        .empty();
      if (options.submit.success) {
        options.submit.success(result);
      }
    }
  });
};
