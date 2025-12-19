(function(){
  // Trello Power-Up client code to parse card titles and generate downloadable .ics event files.

  // Helper to extract date parts from a raw date string (digits and dots).
  function normalizeDateParts(rawDate) {
    // Remove trailing dots
    var cleaned = rawDate.replace(/\.+$/, '');
    // If contains dots, split on dots, filter empty segments
    if (cleaned.indexOf('.') !== -1) {
      return cleaned.split('.').filter(function(part){ return part.length > 0; });
    }
    // No dots. Determine by length: DDMM, DDMMYY, DDMMYYYY
    if (cleaned.length === 4) {
      return [cleaned.slice(0,2), cleaned.slice(2,4)];
    }
    if (cleaned.length === 6) {
      return [cleaned.slice(0,2), cleaned.slice(2,4), cleaned.slice(4,6)];
    }
    if (cleaned.length === 8) {
      return [cleaned.slice(0,2), cleaned.slice(2,4), cleaned.slice(4,8)];
    }
    throw new Error('Unrecognized date format: ' + rawDate);
  }

  function parseFlexibleDate(rawDate) {
    var parts = normalizeDateParts(rawDate).map(function(p){ return parseInt(p,10); });
    var day = parts[0];
    var month = parts[1] - 1; // zero-indexed month
    var year;
    if (parts.length === 3) {
      year = parts[2] < 100 ? 2000 + parts[2] : parts[2];
    } else {
      // Use current year if none provided
      year = new Date().getFullYear();
    }
    return new Date(year, month, day);
  }

  // Parse a time string (HH:mm or HH) into hours and minutes
  function parseTime(timeStr) {
    if (!timeStr) return null;
    var parts = timeStr.split(':');
    var hours = parseInt(parts[0], 10);
    var minutes = parts.length > 1 ? parseInt(parts[1], 10) : 0;
    return { hours: hours, minutes: minutes };
  }

  // Apply time to a date object, return new Date with given hours/minutes
  function applyTime(date, time) {
    if (!time) return date;
    var d = new Date(date.getTime());
    d.setHours(time.hours, time.minutes, 0, 0);
    return d;
  }

  // Extract title and pax (guest count) from remaining text
  function extractTitleAndPax(text) {
    var paxMatch = text.match(/(\d+)\s*pax$/i);
    var pax = paxMatch ? paxMatch[1] : null;
    var title = paxMatch ? text.slice(0, paxMatch.index).trim() : text.trim();
    return { title: title, pax: pax };
  }

  // Main parser: from card text to structured object {date, hasTime, title, pax}
  function parseCardText(cardText) {
    // Regex to capture date, optional time, and the rest.
    var prefixRegex = /^([\d\.]+)\s*(\d{1,2}(?::\d{1,2})?)?\s*(.*)$/;
    var match = cardText.match(prefixRegex);
    if (!match) throw new Error('Invalid card format: ' + cardText);
    var rawDate = match[1];
    var rawTime = match[2];
    var rest = match[3];
    var baseDate = parseFlexibleDate(rawDate);
    var time = parseTime(rawTime);
    var date = applyTime(baseDate, time);
    var parts = extractTitleAndPax(rest);
    return {
      date: date,
      hasTime: !!time,
      title: parts.title || '',
      pax: parts.pax || null
    };
  }

  // Escape special characters for iCalendar fields
  function escapeICS(text) {
    return (text || '').replace(/\\/g, '\\\\')
                      .replace(/\n/g, '\n')
                      .replace(/,/g, '\,')
                      .replace(/;/g, '\;');
  }

  // Format a date object into an all-day iCalendar date string (YYYYMMDD)
  function formatAllDay(date) {
    var year = date.getFullYear();
    var month = ('0' + (date.getMonth() + 1)).slice(-2);
    var day = ('0' + date.getDate()).slice(-2);
    return '' + year + month + day;
  }

  // Format a date object into an iCalendar date-time string (YYYYMMDDTHHMMSSZ) in UTC
  function formatDateTime(date) {
    var year = date.getUTCFullYear();
    var month = ('0' + (date.getUTCMonth() + 1)).slice(-2);
    var day = ('0' + date.getUTCDate()).slice(-2);
    var hours = ('0' + date.getUTCHours()).slice(-2);
    var minutes = ('0' + date.getUTCMinutes()).slice(-2);
    var seconds = ('0' + date.getUTCSeconds()).slice(-2);
    return '' + year + month + day + 'T' + hours + minutes + seconds + 'Z';
  }

  // Format a local date/time for iCalendar with timezone Europe/Vienna
  function formatWithTimezone(date) {
    var year = date.getFullYear();
    var month = ('0' + (date.getMonth() + 1)).slice(-2);
    var day = ('0' + date.getDate()).slice(-2);
    var hours = ('0' + date.getHours()).slice(-2);
    var minutes = ('0' + date.getMinutes()).slice(-2);
    var seconds = ('0' + date.getSeconds()).slice(-2);
    return '' + year + month + day + 'T' + hours + minutes + seconds;
  }

  // Generate iCalendar content for the event
  function generateICS(parsed) {
    var uid = 'id-' + Math.random().toString(36).substr(2, 9) + '@trello-powerup';
    var now = new Date();
    var dtStamp = formatDateTime(now);
    var lines = [];
    lines.push('BEGIN:VCALENDAR');
    lines.push('VERSION:2.0');
    lines.push('PRODID:-//Calendar Event Power-Up//EN');
    lines.push('CALSCALE:GREGORIAN');
    lines.push('BEGIN:VEVENT');
    lines.push('UID:' + uid);
    lines.push('DTSTAMP:' + dtStamp);
    if (parsed.hasTime) {
      // Use timezone for DTSTART and DTEND. We'll default to one-hour event.
      var startLocal = formatWithTimezone(parsed.date);
      var endDate = new Date(parsed.date.getTime() + 60 * 60 * 1000);
      var endLocal = formatWithTimezone(endDate);
      // Use timezone Europe/Vienna
      lines.push('DTSTART;TZID=Europe/Vienna:' + startLocal);
      lines.push('DTEND;TZID=Europe/Vienna:' + endLocal);
    } else {
      var startDay = formatAllDay(parsed.date);
      // End date should be next day for all-day events
      var endDayDate = new Date(parsed.date.getTime() + 24 * 60 * 60 * 1000);
      var endDay = formatAllDay(endDayDate);
      lines.push('DTSTART;VALUE=DATE:' + startDay);
      lines.push('DTEND;VALUE=DATE:' + endDay);
    }
    lines.push('SUMMARY:' + escapeICS(parsed.title));
    if (parsed.pax) {
      lines.push('DESCRIPTION:' + escapeICS('Guests: ' + parsed.pax + ' pax'));
    }
    lines.push('END:VEVENT');
    lines.push('END:VCALENDAR');
    return lines.join('\r\n');
  }

  // Check if we're in an iframe context or main initialization
  if (window.location.search.indexOf('iframe') !== -1 || document.getElementById('event-info')) {
    // We're in the iframe showing event details
    var t = window.TrelloPowerUp.iframe();

    function buildPage() {
      return t.card('name').then(function(card) {
      var container = document.getElementById('event-info');
      try {
        var parsed = parseCardText(card.name);
        var ics = generateICS(parsed);
        
        // Create download link with data URI instead of blob to avoid CORS issues
        var dataUri = 'data:text/calendar;charset=utf-8,' + encodeURIComponent(ics);
        var link = document.createElement('a');
        link.href = dataUri;
        link.download = (parsed.title || 'event') + '.ics';
        link.textContent = '\uD83D\uDCC5 Download Event (.ics)';
        link.style.display = 'inline-block';
        link.style.padding = '8px 12px';
        link.style.marginTop = '10px';
        link.style.background = '#0079BF';
        link.style.color = '#fff';
        link.style.borderRadius = '4px';
        link.style.textDecoration = 'none';
        link.style.cursor = 'pointer';
        
        // Clear and insert
        container.innerHTML = '';
        var summary = document.createElement('div');
        summary.textContent = 'Event: ' + parsed.title;
        var dateInfo = document.createElement('div');
        if (parsed.hasTime) {
          var options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
          var locale = 'en-GB';
          dateInfo.textContent = 'Date/Time: ' + parsed.date.toLocaleString(locale, options);
        } else {
          var optionsDay = { year: 'numeric', month: 'long', day: 'numeric' };
          dateInfo.textContent = 'Date: ' + parsed.date.toLocaleDateString('en-GB', optionsDay);
        }
        container.appendChild(summary);
        container.appendChild(dateInfo);
        if (parsed.pax) {
          var guests = document.createElement('div');
          guests.textContent = 'Guests: ' + parsed.pax;
          container.appendChild(guests);
        }
        container.appendChild(link);
        
        // Resize iframe after content is added
        return t.sizeTo('#container');
      } catch (e) {
        container.innerHTML = '<div style="color:red">Error parsing card: ' + e.message + '</div>';
        return t.sizeTo('#container');
      }
    });
  }

    // Initialize immediately to avoid timeout
    t.render(function(){
      return buildPage();
    });
  } else {
    // We're in the main context - register the Power-Up capabilities
    window.TrelloPowerUp.initialize({
      'card-buttons': function(t, options) {
        return [{
          icon: '📅',
          text: 'Calendar Event',
          callback: function(t) {
            return t.popup({
              title: 'Calendar Event',
              url: './index.html?iframe=true',
              height: 200
            });
          }
        }];
      }
    });
  }

})();