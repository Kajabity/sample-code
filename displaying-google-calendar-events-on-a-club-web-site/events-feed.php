<?php 
// This is the Public calendar feed address with the extra parameters.
$calendarURL = "http://www.google.com/calendar/feeds/calendar@thistlesociety.org.uk/public" .
	"/full?singleevents=true&futureevents=true&orderby=starttime&sortorder=ascending";   

// Initialise a cURL instance with the calendar URL. 
$ch = curl_init(); 
curl_setopt($ch, CURLOPT_URL, $calendarURL); 

//return the transfer as a string 
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1); 

// Fetch the Calendar Events into $feed.
$feed = curl_exec($ch); 

//	Tidy up afterwards to release resources. 
curl_close($ch);

//	Make sure it is recognised as XML.
header( "Content-type: text/xml" );

//  and send it to the browser.
echo $feed;
?>