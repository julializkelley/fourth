function wrap(bodyHtml: string) {
  return `
  <div style="background:#1F2430;padding:32px 20px;font-family:-apple-system,Helvetica,Arial,sans-serif;">
    <div style="max-width:480px;margin:0 auto;background:#2A303F;border-radius:10px;padding:28px 24px;color:#F5EFE6;">
      <div style="font-size:18px;font-weight:600;margin-bottom:18px;">Fourth<span style="color:#D98F6B;">.</span></div>
      ${bodyHtml}
    </div>
  </div>`;
}

function formatWhen(dayLabel: string, scheduledAt: string | null) {
  if (!scheduledAt) return dayLabel;
  const d = new Date(scheduledAt);
  const formatted = d.toLocaleString([], {
    weekday: "long",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
  return formatted;
}

export function claimConfirmationEmail(momName: string, description: string, dayLabel: string, scheduledAt: string | null) {
  return {
    subject: `You're confirmed to help ${momName}`,
    html: wrap(`
      <p style="font-size:15px;line-height:1.6;margin-bottom:16px;">Thanks for stepping up. You're signed up for:</p>
      <div style="background:#1F2430;border-radius:8px;padding:16px 18px;margin-bottom:16px;">
        <div style="font-size:15px;font-weight:600;">${description}</div>
        <div style="font-family:monospace;font-size:12px;color:#8B95A6;margin-top:6px;">${formatWhen(dayLabel, scheduledAt)}</div>
      </div>
      <p style="font-size:13.5px;color:#8B95A6;line-height:1.6;">${scheduledAt ? "We'll send you a reminder the day before and a few hours before." : "No exact time was set for this one, so we won't send timed reminders."}</p>
    `),
  };
}

export function dayBeforeReminderEmail(momName: string, description: string, dayLabel: string, scheduledAt: string | null) {
  return {
    subject: `Reminder: tomorrow you're helping ${momName}`,
    html: wrap(`
      <p style="font-size:15px;line-height:1.6;margin-bottom:16px;">Just a heads up — tomorrow you're signed up for:</p>
      <div style="background:#1F2430;border-radius:8px;padding:16px 18px;">
        <div style="font-size:15px;font-weight:600;">${description}</div>
        <div style="font-family:monospace;font-size:12px;color:#8B95A6;margin-top:6px;">${formatWhen(dayLabel, scheduledAt)}</div>
      </div>
    `),
  };
}

export function hoursBeforeReminderEmail(momName: string, description: string, dayLabel: string, scheduledAt: string | null) {
  return {
    subject: `Reminder: in a few hours you're helping ${momName}`,
    html: wrap(`
      <p style="font-size:15px;line-height:1.6;margin-bottom:16px;">This is happening soon — you signed up for:</p>
      <div style="background:#1F2430;border-radius:8px;padding:16px 18px;">
        <div style="font-size:15px;font-weight:600;">${description}</div>
        <div style="font-family:monospace;font-size:12px;color:#8B95A6;margin-top:6px;">${formatWhen(dayLabel, scheduledAt)}</div>
      </div>
    `),
  };
}
