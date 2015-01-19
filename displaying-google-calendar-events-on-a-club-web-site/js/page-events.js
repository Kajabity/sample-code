/*
 * Kajabity.com Google Calendar Demo JavaScript - http://www.kajabity.com/wicked-text/
 * 
 * Copyright (c) 2014 Williams Technologies Limited
 * 
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 * 
 * http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 * 
 * Kajabity is a trademark of Williams Technologies Limited.
 * http://www.williams-technologies.co.uk
 */
/**
 * @fileOverview Google Calendar Demo
 * @author Simon J. Williams
 */
(function(jQuery) {

	/**
	 * Names of the days of the week.
	 */
	var WeekDays = new Array("Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat");

	/**
	 * Ordinal (?) days of the month.
	 */
	var MonthDays = new Array("-", "1st", "2nd", "3rd", "4th", "5th", "6th",
			"7th", "8th", "9th", "10th", "11th", "12th", "13th", "14th",
			"15th", "16th", "17th", "18th", "19th", "20th", "21st", "22nd",
			"23rd", "24th", "25th", "26th", "27th", "28th", "29th", "30th",
			"31st");

	/**
	 * Names of the months.
	 */
	var Months = new Array("January", "February", "March", "April", "May",
			"June", "July", "August", "September", "October", "November",
			"December");

	/**
	 * Parse an XML format date (YYYY-MM-DD...) and format for display on home
	 * page event list.
	 * 
	 * @param dateString -
	 *            the XML formatted date string.
	 * @return a date string formatted as "Dth Mmm Yyyy".
	 */
	function ts_formatDateSimple(d) {
		// var d = ts_parseDate(dateString);
		if (d == null) {
			return "";
		}

		return MonthDays[d.getDate()] + " " + Months[d.getMonth()] + " "
				+ d.getFullYear();
	}

	/**
	 * 
	 * @param dateString -
	 *            the XML formatted date string.
	 * @return a date string formatted as "".
	 */
	function ts_formatMonthDay(d) {
		// var d = ts_parseDate(dateString);
		if (d == null) {
			return "";
		}

		return WeekDays[d.getDay()] + " " + MonthDays[d.getDate()];
	}

	/**
	 * Parse an XML format date (YYYY-MM-DD...) and format for display on home
	 * page event list.
	 * 
	 * @param dateString -
	 *            the XML formatted date string.
	 * @return a date string formatted as "Dth Mmm Yyyy".
	 */
	function ts_formatMonth(d) {
		// var d = ts_parseDate(dateString);
		if (!d) {
			return "-";
		}

		return Months[d.getMonth()] + " " + d.getFullYear();
	}

	/**
	 * 
	 * @param d
	 * @return
	 */
	function ts_formatTime(d) {
		if (d == null) {
			return "";
		}
		var hours = d.getHours();
		var ampm = "am";
		if (hours > 12) {
			hours -= 12;
			ampm = "pm";
		}

		var mins = d.getMinutes() + 100;

		return hours.toString() + ":" + mins.toString().substr(1) + ampm;
	}

	// jQuery( document ).ready(
	// function($)
	// {

	// The HTML for the entries is collected into this string.
	var htmlEntries = '';
	// Entries are grouped by Month in the display.
	var lastMonth = '';

	/**
	 * Handle an individual event.
	 */
	function handleEvent() {
		var event = new CalendarEvent(this);

		var thisMonth = ts_formatMonth(event.startDate);
		if (thisMonth != lastMonth) {
			if (lastMonth != '') {
				htmlEntries += '</table>';
			}

			htmlEntries += '<h3 class="event-month">' + thisMonth + '</h3>';
			htmlEntries += '<table class="events" align="center" width="85%" cellspacing="5">';
			htmlEntries += '<tr><td colspan="2"><hr color="silver"></td></tr>';

			lastMonth = thisMonth;
		}

		var sDay = ts_formatMonthDay(event.startDate);
		htmlEntries += '<tr><td class="events" width="30%"><strong>' + sDay;
		var eDay = ts_formatMonthDay(event.endDate);
		if (event.endDate != null && sDay != eDay) {
			htmlEntries += ' - ' + eDay;
		}
		htmlEntries += '</strong>';

		if (!event.allDay) {
			htmlEntries += '<br>' + ts_formatTime(event.startDate);

			if (ts_formatTime(event.startDate) != ts_formatTime(event.endDate)) {
				htmlEntries += ' - ' + ts_formatTime(event.endDate);
			}
		}

		htmlEntries += '</td>';
		htmlEntries += '<td class="events">';
		htmlEntries += '<strong style="background-color: ' + event.eventColor + ';">'
				+ event.eventTitle + '</strong><br/>';

		if (event.eventLocation != null && event.eventLocation.length > 0) {
			htmlEntries += '<em><a href="http://maps.google.com/?q='
					+ event.eventLocation + '" target="_blank">' + event.eventLocation
					+ '</a></em><br>';
		}

		htmlEntries += '<p>' + jQuery.wickedText(event.eventDescription) + '</p>';
		htmlEntries += '</td></tr><tr><td colspan="2"><hr color="silver"></td></tr>';
	}

	/**
	 * Handle the ready event when the calendar feed is returned.
	 * 
	 * @param xml -
	 *            the XML content of the calendar feed.
	 */
	function handleCalendar(xml, textStatus, jqXHR) {
		// Parse the feed into a tree of JS objects.
		var feed = jQuery("feed", xml);

		// Iterate through all of the entries.
		jQuery(feed).children("entry").each(handleEvent);

		// Insert the entries into the page.
		jQuery("#entries").html(htmlEntries);
	}

	/**
	 * Handle any errors returned by the AJAX call.
	 */
	function handleError() {
		alert("Unable to fetch event details.");
	}

	jQuery.ajax({
		type : "GET",
		url : "events-feed.php",
		contentType : 'text/xml',
		dataType : "xml",
		error : handleError,
		success : handleCalendar
	});
	// } );
})(jQuery);
