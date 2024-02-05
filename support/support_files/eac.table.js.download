/**
 * Inserts a styled table into the target div.
 *
 * [in] tpl: The template to render each row with. Can be a jinja2 template, or an array with row templates like:
 *   [in] key: The key in the row data to render to this cell.
 *   [in_opt] header: The header of the table column.
 *   [in_opt] width: The columns width in pixels.
 *   [in_opt] safe: Boolean indicating whether or not to escape the input value. Default is false.
 *   [in_opt] hidden: Boolean indicating whether or not to hide the column. Default is false.
 *   [in_opt] sort: Function that returns a signed integer indicating whether x is equal to y (0), smaller than y (-1), or greater than y (+1). x and y are the UI text values of the cells of two different rows.
 * [in] rows: Dictionary with the data to render to the table. With fields 'data' and 'empty'.
 *	 [in] data: An array containing all objects to render to the table.
 *	 [in_opt] empty: A string to render as a single row when data is empty.
 *	 [in_opt] formatRow: A function returning a dictionary with keys to render to the template row. Should not alter the input data.
 * [in_opt] header:   The table header. Ignored if the tpl rows define a header.
 *	 [in] tplArgs: The values to render to the table header, based on the given template.
 *	 [in_opt] tpl: The template to render the table header by; When undefined, the default template is used.
 *	 [in_opt] hideOnEmpty: Hide the header if no rows are to be added. Default is false.
 * [in_opt] insert:
 * 	 [in] tplArgs: The arguments to display in the to-be-clicked row.
 *	 [in] form: The form to display when insertion is triggered.
 *	 [in_opt] tpl: The template to render tplArgs to; When undefined, the default template is used.
 *	 [in_opt] isFirst: Set true to insert new items to the start of the table. Defaults to false.
 *	 [in_opt] cancelId: The jQuery identifier of the element that triggers cancellations.
 *	 [in_opt] resultKey: The resource key of a successful entry.
 *	 [in_opt] onInsert: The function to call whenever a new row is inserted.
 */
eac.table = function(options) {
	var tpl = options.tpl;
	var rows = options.rows;
	var header = options.header;
	var insertArgs = options.insert;
	var editArgs = options.edit;

	// Set up the table and select the body.
	var table = $($(options.target).html(
		'<table class="styled-table"><tbody></tbody></table>').
		children().eq(0));

	// Format the parameters if tpl definition is used.
	if (tpl.cols) {
		header = { tpl: '', tplArgs: {}, hideOnEmpty: header ? header.hideOnEmpty : false };  // Overwrite the original header with the templated one.
		var cols = tpl.cols.slice();

		tpl = '';   // Append each column to the row template
		var headerCount = 0;  // We'll be generating the header template for all columns. Afterwards we check if it was necessary for at least one.
		$.each(cols, function(i, def) {
			var cellContent = vsprintf('{{%s%s}}', [def.key, def.safe ? '|safe' : '']);

			// Construct the column header template.
			if (!def.hidden) {
				if (def.header) { headerCount++; }
				var headerActions = def.sort ? '<i class="font-icon-sort clickable" style="float:right"></i>' : '';
				header.tpl += '<th' + (def.tooltip ? ' title="' + def.tooltip + '"' : '') + '>' + cellContent + headerActions + '</th>';
				// Add header value for the column on the right depth in the header dictionary.
				eac.reflection.setObjectAttribute({target: {path: def.key, value: header.tplArgs}, value: def.header});
			}

			// Construct the column cell template.
			if (def.format) { cellContent = vsprintf(def.format, [cellContent, cellContent, cellContent]); }

			var cell = $('<td valign="top"' + (def.tooltip ? ' title="' + def.tooltip + '"' : '') + '>' + cellContent + '</td>');
			if (!isUndefined(def.width)) cell.css('width', def.width);
			if (!isUndefined(def.height)) cell.css('max-height', def.height).css('display', 'block').css('overflow-y', 'auto');
			if (!isUndefined(def.class)) cell.addClass(def.class);
			if (!isUndefined(def.hidden) && def.hidden) cell.css('display', 'none');
			tpl += cell[0].outerHTML;
		});

		if (!headerCount) { header = undefined; }
		tpl = '<tr>' + tpl + '</tr>';
	}

	// Get an array of functions that fetch the data for each row.
	var dataSource = rows.async && rows.async.data ? rows.async.data.rows : rows.data;
	var hasRows = dataSource && dataSource.length || Object.keys(dataSource).length;
	if (hasRows) {
		var getRowGetter = function(rowData, rowIndex) {
			return {
				index: rowIndex,
				preCallData: rowData,
				// ToDO: Should be async, but breaks event handling of the using class
				get: function(onResult) { onResult(rowData); }
			}
		};

		if (rows.async) {
			getRowGetter = function(rowData, rowIndex) {
				var preCallData = {};
				preCallData[rows.async.data.key] = rowData;
				return {
					index: rowIndex,
					preCallData: preCallData,
					get: function(onResult) { rows.async.get(rowData, onResult); }
				}
			}
		}

		var rowGetters = [];
		$.each(dataSource, function(rowIndex, rowData) {
			rowGetters.push(getRowGetter(rowData, rowIndex));
		});

		dataSource = rowGetters;
	}

	// Add table header.
	if (header) {
		var updateHeader = function() {
			var headerTpl = header.tpl ? header.tpl : tpl;
			var headerValues = !isUndefined(header.tplArgs) ? header.tplArgs : header;
			var $header = $(jinja.render(headerTpl.split('td').join('th'), headerValues));
			table.prepend($header);
			$header.find('.font-icon-sort').click(function(clickArgs) {
				clickArgs.preventDefault();
				var $target = $(clickArgs.target).closest('th');
				var direction = $target.attr('direction') == 'desc' ? 1 : -1;
				$target.attr('direction', direction > 0 ? 'asc' : 'desc');

				var colIndex = $target.index();
				var doSort = options.tpl.cols[colIndex].sort;
				table.find('tr').sort(function(x,y) {
					return doSort($(x).find('td').eq(colIndex).text(), $(y).find('td').eq(colIndex).text()) * direction;
				}).each(function(i, el) {
					$(el).detach().appendTo(table);
				});
			});
		};

		if (!hasRows && header.hideOnEmpty) {
			insertArgs.updateHeader = updateHeader;
		} else {
			updateHeader();
		}
	}

	// Set the table up to add the data rows.
	var colCount = tpl.split('<td').length - 1;
	tpl = jinja.compile(tpl);
	tpl.colCount = colCount;

	// Get the data formatter for the rows.
	var formatData = rows.formatRow ? rows.formatRow : function(row) { return row; };
	var formatRow = function(row, rowIndex) {
		return formatData(row, rowIndex);
	};

	// Add all data rows.
	var renderRow = function(rowData, rowIndex) { return $(tpl.render(formatRow(rowData, rowIndex))) };
	if (hasRows) {
		$.each(dataSource, function(index, row) {
			var rowIndex = index;
			var tableRow = renderRow(row.preCallData, row.index).appendTo(table);
			var replaceTableRow = function(newTableRow, rowData) {
				newTableRow = $(newTableRow);
				if (row.class) {
					newTableRow.addClass(row.class);
				}

				tableRow.replaceWith(newTableRow);
				tableRow = newTableRow;
				tableRow.toggle(!rows.paging || rowIndex < rows.paging.size);
				if (rows.id) {
					$.each(Array.isArray(rows.id) ? rows.id : [rows.id], function(idIndex, rowAttr) {
						var idData = rowData;
						$.each(rowAttr.value.split('.'), function(pathKeyIndex, pathKey) {
							idData = idData[pathKey];
						});
						tableRow.attr(rowAttr.key, idData);
					});
				}
			};
			replaceTableRow(tableRow, row.preCallData);

			var fetchRow = function() {
				row.get(function (rowData) {
					replaceTableRow(renderRow(rowData, row.index), rowData);
					if (rows.async && rows.async.refreshInterval) {
						setTimeout(fetchRow, rows.async.refreshInterval * 1000);
					}
				});
			};
			fetchRow();
		});
	} else {
		table.append(vsprintf('<tr class="no-rows-message"><td colspan="%s">%s</td></tr>',
			[tpl.colCount, !isUndefined(rows.empty) ? rows.empty : 'No data']));
	}

	// Handle row actions: edit.
	if (editArgs) {
		table.find(editArgs.trigger).click(function(clickArgs) {
			clickArgs.preventDefault();

			var $row = $(clickArgs.target).closest('tr');
      if ($row.next().hasClass('edit-form-row')) {
        $row.next().remove();
        return;
      }

      // Fetch the form for editing the row.
			editArgs.getForm($row, function($form) {
        var $formRow = $('<tr class="edit-form-row"></tr>')
	        .append($(vsprintf('<td colspan="%s"></td>', [$row.find('td').length]))
	        .append($form))
	        .insertAfter($row);
        $formRow.find('.cancel').click(function(cancelArgs) {
          cancelArgs.preventDefault();
          $formRow.remove();
        });

        eac.forms.ajax({
          form: $form,
	        submit: editArgs.submit,
          success: editArgs.success,
          error: editArgs.error
        });
			});
		});
	}

	// Add insertion row.
	if (insertArgs) {
		var insertTpl = insertArgs.tpl ? jinja.compile(insertArgs.tpl) : tpl;
		var triggerRow = $(insertTpl.render(insertArgs.tplArgs)).addClass('clickable');
		triggerRow.click(function(clickArgs) {
			return enableInsertFromClick(clickArgs, insertArgs, tpl, renderRow);
		});

		var firstCell = table.find('td:first');
		if (insertArgs.isFirst && firstCell.length) {
			firstCell.parent().before(triggerRow); }
		else {
			table.append(triggerRow);
		}

		if (!hasRows && !isUndefined(rows.empty) && !rows.empty) {
			triggerRow.click();
		}
	}

	// Add expansion row.
	if (rows.paging && dataSource.length > rows.paging.size) {
		var expandRow = vsprintf(
			'<tr class="clickable"><td colspan="%s"><a href="%s" class="font-icon-chevron-right"> More..</a></td></tr>',
			[tpl.colCount, rows.paging.target ? rows.paging.target : '#']);
		expandRow = $(expandRow).appendTo(table);
		if (rows.paging.target) {
			expandRow.click(function (args) {
				var $target = $(args.target);
				if (!$target.is('a')) {
					args.preventDefault();
					eac.url.redirect({url: rows.paging.target});
				}
			});
		} else {
			expandRow.click(function (args) {
				args.preventDefault();
				var enabledRows = 0;
				$.each(table.find('tr'), function (index, row) {
					if (enabledRows < rows.paging.size && !$(row).is(':visible')) {
						$(row).show();
						enabledRows++;
					}
				});

				if (!table.find('tr:hidden').length) {
					expandRow.hide();
				}
			});
		}
	}

	return table;
};

function enableInsertFromClick(clickArgs, insertArgs, tpl, renderRow) {
	var formRow = $(sprintf('<tr><td colspan="%s"></td></tr>', tpl.colCount));
	$(formRow.children().eq(0)).html(insertArgs.form);
	var triggerRow = $(clickArgs.currentTarget);
	if (insertArgs.isFirst) { triggerRow.before(formRow) }
	else {                    triggerRow.after(formRow); }
	triggerRow.hide();
	if (eac.forms && eac.forms.help) { eac.forms.help({form: formRow}); }

	var exitFormRow = function() {
		formRow.remove();
		triggerRow.show();
	};

	// Handle cancellation
	formRow.find(insertArgs.cancelId || '.cancel').click(function() {
		exitFormRow();
		return false;	// Mark the click as handled
	});

	// Callback for further form setup.
	if (insertArgs.onFormShown) {
		formRow.show();
		insertArgs.onFormShown(formRow.find('form'));
	}

	// Handle insertions
	if (insertArgs.ajax !== false) {
		eac.forms.ajax({
			form: formRow.find('form'),
			formData: insertArgs.formData,
			submit: insertArgs.submit,
			error: function(result) {
				console.debug('insert error', result);
			},
			success: function (result) {
				if (insertArgs.resultKey) {
					var newRow = renderRow(result[insertArgs.resultKey]);
					if (insertArgs.isFirst) { triggerRow.after(newRow); }
					else {                    triggerRow.before(newRow); }

					triggerRow.parent().find('.no-rows-message').remove();
					if (insertArgs.updateHeader) {
						insertArgs.updateHeader();
					}
				}

				if (!insertArgs.onInsert || insertArgs.onInsert(result, formRow.find('form')) !== false) {
					exitFormRow();
				}
			}
		});
	}


	return false; // Mark the click as handled
}