/**
 * Construct an "Event" wrapper with properties parsed from the input XML.
 * 
 * @param event
 *            the XML event retrieved from the feed result.
 * @return a new CalendarEvent instance.
 */
function CalendarEvent(event) {

	this.eventXml = event;
	this.eventTitle = $(event).find("title").text();

	var content = $(event).find("content").text();

	// Try to extract the older V2 style data - but if that fails assume it's
	// all in the Description.

	// Find last when element in case "originalEvent" element present.
	var whenElement = $(CalendarEvent.nsgd + "when:last", event);

	// Need to work out how to handle the namespaces on some
	// elements. If not found, then try a different way of handling namespaces.
	if (whenElement.length == 0) {
		// Some browsers ignore the namespace.
		CalendarEvent.nsgd = "";
		whenElement = $(CalendarEvent.nsgd + "when:last", event);
	}

	// Did we find it?
	if (CalendarEvent.isEmpty(whenElement)) {
		// alert( this.eventDescription );

		/**
		 * Here's what the "/basic" description looks like. When: Mon 19 Jan
		 * 2015 19:00 to 22:15 GMT<br />
		 * 
		 * <br />
		 * Where: St. Teresa’s Catholic Church Hall, College Road, Upholland,
		 * Wigan. WN8 OPY <br />
		 * Event Status: confirmed <br />
		 * Event Description: * Tuition : 7pm-8pm (Children with parents
		 * welcome) * General : 8pm – 10.15pm
		 */
		var re_When = /When:\s+((\w+\s+\d+\s+\w+\s+\d+)(\s+\d+:\d+)?)(\s+to\s+((\w+\s+\d+\s+\w+\s+\d+)?(\d+:\d+)?)([\n\s]+(\w+))?)?/;
		var re_Where = /<br \/>Where:\s+(.+)\n/;
		var re_Status = /<br \/>Event Status:\s+(.+)\n/;
		var re_Description = /Event Description:/;
		var matches;

		// Find the start of the description and extract it - leaving the other
		// bits behind..
		if ((matches = content.match(re_Description)) !== null) {
			this.eventDescription = content.substring(matches.index
					+ matches[0].length);
			content = content.substring(0, matches.index);
		} else {
			this.eventDescription = "";
		}

		// Find and extract the "When" string.
		if ((matches = content.match(re_When)) !== null) {
			// 0 all matched
			// 1 start date time
			// 2 start date
			// 3 start time
			// 4 "to" section
			// 5 end date time
			// 6 end date
			// 7 end time
			// 8 "GMT" string
			// 9 GMT
			var zoneStr = "";
			if (matches[9]) {
				// Going to leave off the zone as "BST" breaks it and if you
				// actually set it to "+0100" it gives the wrong time!

				// zoneStr = " " + matches[9];
			}

			var whenStr = matches[1] + " " + zoneStr;
			this.allDay = !matches[3];
			this.startDate = new Date(whenStr);

			if (matches[5]) {
				var endDateStr = matches[5] + " " + zoneStr;

				if (!matches[6]) {
					endDateStr = matches[2] + " " + endDateStr;
				}

				this.endDate = new Date(endDateStr);
			} else {
				this.endDate = this.startDate;
			}

			// this.eventDescription = this.eventDescription + "\n\n'''" +
			// matches[0] + "'''";
		}

		// Find and extract the "Where" string.
		if ((matches = content.match(re_Where)) !== null) {
			this.eventLocation = matches[1];
		}

		// Find and extract the "Status" string.
		if ((matches = content.match(re_Status)) !== null) {
			// Ignored...
		}

		// this.eventDescription = this.eventDescription + "\n\n{{{" + content +
		// "}}}";
	} else {
		this.eventDescription = content;
		var startDateStr = whenElement.attr("startTime");
		this.allDay = (startDateStr && startDateStr.length == 10);
		this.startDate = parseDate(startDateStr);
		var endDateStr = whenElement.attr("endTime");
		this.endDate = parseDate(endDateStr);

		this.eventColor = $(event).find(CalendarEvent.nsgd + "color").text();

		// Fix extra day issue.
		if (allDay && endDate != null) {
			endDate.setDate(endDate.getDate() - 1);
		}

		this.eventLocation = '';
		var eventWhere = $(event).find(CalendarEvent.nsgd + "where");
		if (eventWhere !== undefined) {
			this.eventLocation = eventWhere.attr("valueString");
		}
	}
}

/**
 * Initialise the "gd" namespace prefix.
 */
CalendarEvent.nsgd = "gd\\:";

/**
 * Test if a string is null or empty.
 * 
 * @param text
 *            the string to check for emptiness
 * @return true if the string is null or zero length (empty).
 */
CalendarEvent.isEmpty = function(text) {
	return text == null || text.length == 0;
};

/**
 * Remove a section from a string.
 * 
 * @param text
 *            the string to have a section removed from.
 * @param start
 *            zero based index where the removed section starts.
 * @param length
 *            length of string to remove.
 * @return the modified section.
 */
CalendarEvent.removeSection = function(text, start, length) {
	if (text.length < start) {
		return text;
	}

	if (text.length < start + length) {
		return text.substring(0, start);
	}

	return text.substring(0, start) + text.substring(start + length);
};

/**
 * Parse the date and time from an XML date string: e.g.
 * "2010-10-21T23:26:14.000Z".
 * 
 * @param dateString
 *            date to parse.
 * @return Date object or null.
 */
CalendarEvent.parseDate = function(dateString) {
	var d = null;
	// alert( "ts_parseDate: dateString = " + dateString );
	if (dateString != null) {
		var m = dateString
				.match(/^(\d{4})-(\d{2})-(\d{2})(T(\d{2}):(\d{2}):(\d{2})\.?(\d{3})([\d+Z:]*))?$/);
		{
			if (m.length == 10) {
				if (!isEmpty(m[9])) {
					d = new Date(m[1], (m[2] - 1), m[3], m[5], m[6], m[7], m[8]);
					// alert( "ts_parseDate: d = " + d );
				} else if (!isEmpty(m[3])) {
					d = new Date(m[1], (m[2] - 1), m[3]);
					// alert( "ts_parseDate: d = " + d );
				}
			}
		}
	}

	// alert( "ts_parseDate: d final = " + d );
	return d;
};
