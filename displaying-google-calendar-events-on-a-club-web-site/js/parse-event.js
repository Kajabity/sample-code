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
		 * Here's what the "/basic" description looks like to help understand the regular expressions. 
		 * 
		 * When: Mon 19 Jan 2015 19:00 to 22:15 GMT<br />
		 * Local
		 * "When: Fri 30 Jan 2015<br />↵↵<br />Where: St. Teresa’s Catholic Church Hall, College Road, Upholland, Wigan. WN8 OPY↵<br />Event Status: confirmed↵<br />"
		 * Live
		 * "When: Fri Jan 30, 2015<br />↵↵<br />Where: St. Teresa’s Catholic Church Hall, College Road, Upholland, Wigan. WN8 OPY↵<br />Event Status: confirmed↵<br />"
		 * <br />
		 * Where: St. Teresa’s Catholic Church Hall, College Road, Upholland,
		 * Wigan. WN8 OPY <br />
		 * Event Status: confirmed <br />
		 * Event Description: * Tuition : 7pm-8pm (Children with parents
		 * welcome) * General : 8pm – 10.15pm
		 */
		var matches;

		// Find the start of the description and extract it - leaving the other
		// bits behind..
		var re_Description = /Event Description:/;
		if ((matches = content.match(re_Description)) !== null) {
			this.eventDescription = content.substring(matches.index
					+ matches[0].length);
			content = content.substring(0, matches.index);
		} else {
			this.eventDescription = "";
		}

		// Find and extract the "When" string.
		var re_When = /When:\s+((\w+\s+(\w+\s+\d+,|\d+\s+\w+)\s+\d+)(\s+\d+:\d+)?)(\s+to\s+((\w+\s+(\w+\s+\d+,|\d+\s+\w+)\s+\d+)?(\d+:\d+)?)([\n\s]+(\w+))?)?/;
		if ((matches = content.match(re_When)) !== null) {
			// 0 all matched
			// 1 start date time
			// 2 start date
			// 3 start date variant
			// 4 start time
			// 5 "to" section
			// 6 end date time
			// 7 end date
			// 8 end date variant
			// 9 end time
			//10 "GMT" string
			//11 GMT
			var indexStartDT = 1;
			var indexStartD = 2;
			var indexStartT = 4;
			var indexEndDT = 6;
			var indexEndD = 8;
			var indexEndT = 9;
			var indexZone = 11;

			var zoneStr = "";
			if (matches[indexZone]) {
				// Going to leave off the zone as "BST" breaks it and if you
				// actually set it to "+0100" it gives the wrong time!

				// zoneStr = " " + matches[indexZone];
			}

			var whenStr = matches[indexStartDT] + " " + zoneStr;
			this.allDay = !matches[indexStartT];
			this.startDate = new Date(whenStr);

			if (matches[indexEndDT]) {
				var endDateStr = matches[indexEndDT] + " " + zoneStr;

				if (!matches[indexEndD]) {
					endDateStr = matches[indexStartD] + " " + endDateStr;
				}

				this.endDate = new Date(endDateStr);
			} else {
				this.endDate = this.startDate;
			}

			// this.eventDescription = this.eventDescription + "\n\n'''" +
			// matches[0] + "'''";
		}

		// Find and extract the "Where" string.
		var re_Where = /<br\s+\/>Where:\s+(.+)[\s\n]+/;
		if ((matches = content.match(re_Where)) !== null) {
			this.eventLocation = matches[1];
		}

		// Find and extract the "Status" string.
		var re_Status = /<br \/>Event Status:\s+(.+)\n/;
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

	this.eventColor = $(event).find(CalendarEvent.nsgd + "color").text();
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
