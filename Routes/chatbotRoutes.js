const express = require("express");
const axios = require("axios");
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const monthMap = {
  january: 0, february: 1, march: 2, april: 3,
  may: 4, june: 5, july: 6, august: 7,
  september: 8, october: 9, november: 10, december: 11,
};

const getMonthFromPrompt = (prompt) => {
  const lower = prompt.toLowerCase();
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  if (lower.includes("this month")) return now.getMonth();
  if (lower.includes("next month")) return nextMonth.getMonth();

  for (let name in monthMap) {
    if (lower.includes(name)) return monthMap[name];
  }
  return null;
};

router.post('/generate', async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) return res.status(400).json({ error: 'Prompt is required' });

  try {
    const lowerPrompt = prompt.toLowerCase();
    const apiResponse = await axios.get("http://localhost:3000/api/expo");
    const events = apiResponse.data.data;

    const findEvent = () =>
      events.find(event => lowerPrompt.includes(event.title.toLowerCase()));

    // 1. Speaker / Host
    if (/(speaker|host|who is (speaking|hosting))/.test(lowerPrompt)) {
      const event = findEvent();
      if (event) {
        const speaker = event.speaker && event.speaker !== 'TBD'
          ? event.speaker
          : 'The speaker/host has not been announced yet.';
        return res.json({
          response: `🎤 Speaker Info\n\n📌 **${event.title}**\n🗣️ ${speaker}`
        });
      }
      return res.json({ response: "❓ Please specify which event you're asking about the speaker or host for." });
    }

    // 2. Booth Availability
    if (/available booths?|booth availability/.test(lowerPrompt)) {
      const event = findEvent();
      if (event) {
        return res.json({
          response:
`🛠️ Booth Availability

📌 **${event.title}**
📦 Total Booths: ${event.booth}
✅ Assigned Booths: ${event.assignedBoothCount}
📭 Available Booths: ${event.availableBoothCount}`
        });
      }
      return res.json({ response: "❓ Please specify the event you're asking booth info about." });
    }

    // 3. Exhibitor List
    if (/exhibitor(s)?/.test(lowerPrompt)) {
      const event = findEvent();
      if (event) {
        if (event.exhibitorRequests?.length > 0) {
          const list = event.exhibitorRequests.map((e, i) =>
            `${i + 1}. **${e.name}** (${e.companyName})\n📧 ${e.email}`
          ).join('\n\n');
          return res.json({
            response: `👥 Exhibitors for **${event.title}**\n\n${list}`
          });
        } else {
          return res.json({ response: `⚠️ No exhibitors have registered yet for **${event.title}**.` });
        }
      }
      return res.json({ response: "❓ Please specify the event you're asking about exhibitors for." });
    }

    // 4. Attendee List
    if (/attendees?/.test(lowerPrompt)) {
      const event = findEvent();
      if (event) {
        const count = event.attendeeList?.length || 0;
        return res.json({
          response: `👥 Attendee Count\n\n**${event.title}** has **${count}** registered attendees.`
        });
      }
      return res.json({ response: "❓ Please specify the event you're asking about attendees for." });
    }

    // 5. Filter by month
    const monthIndex = getMonthFromPrompt(lowerPrompt);
    if (monthIndex !== null) {
      const filtered = events.filter(e => new Date(e.date).getMonth() === monthIndex);
      if (filtered.length > 0) {
        const list = filtered.map(e =>
          `📌 **${e.title}**\n📅 Date: ${new Date(e.date).toDateString()}\n📍 Location: ${e.location}`
        ).join("\n\n");

        return res.json({ response: `📆 Events for that month:\n\n${list}` });
      }
      return res.json({ response: "📭 No events found for that month." });
    }

    // 6. Filter by location
    const foundLocation = events.find(e => lowerPrompt.includes(e.location.toLowerCase()));
    if (foundLocation) {
      const locEvents = events.filter(e =>
        e.location.toLowerCase().includes(foundLocation.location.toLowerCase())
      );
      const list = locEvents.map(e =>
        `📌 **${e.title}**\n📅 ${new Date(e.date).toDateString()}\n📍 ${e.location}\n📝 ${e.description}`
      ).join("\n\n");

      return res.json({ response: `📍 Events in **${foundLocation.location}**:\n\n${list}` });
    }

    // 7. Exact event details
    const matched = findEvent();
    if (matched) {
      return res.json({
        response:
`🎫 Event Details

📌 **${matched.title}**
📅 Date: ${new Date(matched.date).toDateString()}
📍 Location: ${matched.location}
📝 Description: ${matched.description}
🕒 Time: ${matched.time || 'TBD'}
🗣️ Speaker: ${matched.speaker || 'TBD'}
🛠️ Booths: ${matched.booth}`
      });
    }

    // 8. General list of all events
    if (/event|expo|show/i.test(lowerPrompt)) {
      const list = events.map(e =>
        `📌 **${e.title}**\n📅 ${new Date(e.date).toDateString()}\n📍 ${e.location}`
      ).join("\n\n");
      return res.json({ response: `📅 Upcoming Events:\n\n${list}` });
    }

    // 9. Gemini fallback (convert text into list)
    const result = await model.generateContent([prompt]);
    const rawText = result.response.text();

    const listItems = rawText
      .split(/\n|•|-|\d+\./)      // split on newlines, bullets, numbers
      .map(item => item.trim())
      .filter(item => item.length > 0);

    return res.json({ response: listItems });

  } catch (error) {
    console.error('❌ Chatbot error:', error.message);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
