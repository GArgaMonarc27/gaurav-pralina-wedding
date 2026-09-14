# Gaurav & Pralina — wedding invitation

https://gargamonarc27.github.io/gaurav-pralina-wedding/#memories

A responsive invitation made from the photos and content in Main-html.zip and Mobile-html.zip. Plain HTML, CSS, and JavaScript; no installation or build is required.

## Preview

Open `index.html` directly, or run `npm start` here and visit http://127.0.0.1:4173. The local server needs Node.js and serves only this folder on your own computer.

## Edit your details

Update `settings.js`:

- `date`: Gregorian date in `YYYY-MM-DD` format. All visible dates and the calendar download update together. An empty or invalid date displays “Date to be announced” and hides the calendar download.
- `venueName`: the venue name in `en` and `ne`. Leave blank until confirmed.
- `location` and `address`: English and Nepali location text.
- `mapsUrl`: an HTTPS venue map link. Directions remain hidden until provided.
- `times`: ceremony times in 24-hour Nepal local time, such as `09:30`. Leave unconfirmed times blank.

The supplied date (11 October 2026) is retained for you to edit. The Nepali spelling “प्रलिना” is provisional; adjust the text in index.html if needed. Nepali dates use Nepali numerals and Gregorian month names, not a Bikram Sambat conversion.

## Design and guest experience

The invitation moves from a personal welcome to the couple’s photographs, the ceremony sequence, family memories, and practical venue details. Ivory, maroon, gold, lotus linework, and a floral toran give the page a traditional foundation, with spacious typography and an arched portrait for a contemporary feel.

Nepali is visible by default. Guests may choose English or Both, with their preference saved only on their device. Photographs support a larger view, arrow keys, swipe, Escape to close, and focus restoration. Photo entrance and scroll animations respect reduced-motion preferences; a pause control is also provided. No sound autoplays. The page includes a skip link, keyboard focus styles, semantic sections, lazy image loading, and print styles.

The calendar download is an all-day event because no ceremony times were provided. Reimport it after changing the date; calendar applications differ in how they handle updates.

## Share or host

Upload `index.html`, `styles.css`, `app.js`, `settings.js`, `favicon.svg`, and the `assets` directory to any static website host. There is no backend, RSVP collection, analytics, or tracking. Google Fonts are optional external requests; system fonts are used if unavailable. Use the ZIP to hand the editable source to a developer. Do not share a localhost link with guests; it works only on the preview computer.

## Verification

Checked in the built-in browser at widths 320, 390, 768, 1024, and 1440 pixels in English, Nepali, and bilingual modes, with no horizontal overflow. Verified all nine supplied photos load, the photo viewer advances and reverses, Escape closes it and returns keyboard focus, language preferences persist, and the motion toggle changes state. Confirmed the three landscape family photos retain their complete aspect ratio. JavaScript syntax and local asset references pass checks.

The calendar action runs without JavaScript errors, but the built-in preview did not report a completed download. Verify the `.ics` download and import in your chosen normal browser/calendar before sharing. Physical iOS and Android devices, Safari, and screen readers were not available for testing.
