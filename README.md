SampleCode for Kajabity.com Articles
====================================

This Git repository holds various kinds of sample code for articles on the [Kajabity.com]{http://www.kajabity.com} website.

Each folder is named after the article and contains the code for a single article or a related series.

It seems that Google deprecated the V2.0 API 
(see [Google	Calendar API v2 Developers Guide: Protocol]{https://developers.google.com/google-apps/calendar/v2/developers_guide_protocol}) 
that this code relied upon back in November 2014 – sadly, it took me a while to notice.

Anyway, I’ve been having a play and found that the Basic API still works – in fact, if 
you get a link to a calendar on its Settings page that is what you are given. Unfortunately, 
that doesn’t present the Event details I need in the same way – they are mixed into the 
“Content” along with the event description.

I’ve updated the code to separate out a <tt>CalendarEvent</tt> class (in <tt>parse-event.js</tt> 
which parses both the old v2.0 "/full" version and also handles the simplified “/basic” response format.
