export async function getSummaryFromPrompt(articleText) {
  await ai.languageModel.capabilities();
  const session = await ai.languageModel.create();
  const stream = await session.promptStreaming(
    `The article is as follows \`${articleText}\`. Output a brief summary including what, when, where, how.
    1. You **must only** use date and time information that is explicitly mentioned or directly and unambiguously derivable **from the provided text itself**.
    2. **Do NOT invent or guess** dates/times if they are not clearly stated in the text.`
  );
  return { session, stream };
}

export async function getSummary(articleText) {
  if (articleText.length > 4000) {
    return { stream: 'may exceed maximum token limit supported by the API' };
  }
  await ai.summarizer.availability();
  const options = {
    sharedContext: '',
    type: 'key-points',
    format: 'markdown',
    length: 'medium'
  };
  const summarizer = await ai.summarizer.create(options);
  const stream = await summarizer.summarizeStreaming(articleText);
  return { stream };
}

const VCalendarTemplate = `BEGIN:VCALENDAR
BEGIN:VEVENT
DTSTART:{extracted_dtstart}
SUMMARY:{extracted_summary}
DESCRIPTION:{extracted_description}
END:VEVENT
END:VCALENDAR
`;
  
export async function getPromptStream(prompt) {
  await ai.languageModel.capabilities();
  const session = await ai.languageModel.create();
  const stream = await session.promptStreaming(prompt);
  return { session, stream };
}

export async function extractAirDropEvent(articleSummary) {
  // const prompt = `Based on the following article summary: \`${articleSummary}\`
  //   Your task is to extract the key information for a calendar event and format it strictly as an iCalendar (VCALENDAR) entry.

  //   Follow these steps and rules:
  //   1. Read the article summary and identify the main event's title/topic, a brief description, and the date/time.
  //   2. If the article summary contains a specific date and time, use that for DTSTART. Make sure it is in ISO 8601 format (YYYYMMDDTHHMMSSZ).If there is airdrop timing, use it. If no specific date/time is mentioned, use a reasonable default or state this limitation.
  //   3. give me explain for the DTSTART you output.
  // `;
  const prompt = `Based on the following article summary: \`${articleSummary}\`
    Your task is to extract the key information for a calendar event and format it strictly as an iCalendar (VCALENDAR) entry.

    Follow these steps and rules:
    1. Read the article summary and identify the main event's title/topic, a brief description, and all the dates/times.
    2. Look for any date and time mentioned in relation to **Airdrop**.
      * If a **complete date and time** (including year, month, day, hour, minute, second, and timezone if available) is found, use that for DTSTART and format it strictly as ISO 8601 (YYYYMMDDTHHMMSSZ).
      * If **only a date** (like "November 2025", "May 1st, 2025", "Nov 5") is mentioned **without a specific time**, construct the DTSTART using the found date, default the time to **090000**, and use **Z** for the timezone. For "November 2025", assume the **1st day** of the month (e.g., 20251101T090000Z). For a date like "May 1st", determine the year from the context if possible, otherwise use a reasonable default year (you might need to define what that default is, e.g., the upcoming year).
      * If **no specific date or time** for the Airdrop is found in the summary at all, **omit the DTSTART line** from the VEVENT block entirely.
   * Do NOT invent dates or times. Only process information found in the summary.
    3. Extract a concise summary for the event.
    4. Extract a short description for the event. Keep the description brief.
    5. Fill in the following VCALENDAR template structure with the extracted information:
      \`\`\`
      ${VCalendarTemplate}
      \`\`\`
      Replace \`{extracted_dtstart}\`, \`{extracted_summary}\`, and \`{extracted_description}\` with the information you extracted.
    6. Ensure the SUMMARY and DESCRIPTION you extract and use do NOT contain '*' or '-'.
    7. Your *final output* must be ONLY the completed VCALENDAR text block, with no extra text, explanations, or markdown fences (like \`\`\`).
    Output the completed VCALENDAR block now:
  `;
  const { session, stream } = await getPromptStream(prompt);
  return { session, stream };
}

export function addToCalendar(icsContent) {
  let icsContentResult = icsContent;
  if (icsContent.indexOf('```') === 0) {
    icsContentResult = icsContent.slice(3, icsContent.length - 3);
  }
  icsContentResult = icsContentResult.trim();
  const blob = new Blob([icsContentResult], { type: 'text/calendar' });
  const url = URL.createObjectURL(blob);
  window.open(url);
}
