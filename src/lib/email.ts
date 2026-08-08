export type EnquiryFormValues = {
  fullName: string;
  email: string;
  phone?: string;
  enquiryType: string;
  eventDate?: string;
  eventLocation?: string;
  budgetRange?: string;
  subject?: string;
  message: string;
  consent: boolean;
  website?: string;
};

export function buildEnquiryEmail(values: EnquiryFormValues, recipient: string) {
  const subject = values.subject?.trim() || `${values.enquiryType} enquiry from ${values.fullName}`;
  const fields = [
    ["Full name", values.fullName],
    ["Email address", values.email],
    ["Phone number", values.phone],
    ["Enquiry type", values.enquiryType],
    ["Event date", values.eventDate],
    ["Event location", values.eventLocation],
    ["Budget range", values.budgetRange],
    ["Subject", values.subject],
    ["Message", values.message]
  ] as const;
  const body = fields
    .filter(([, value]) => value?.trim())
    .map(([label, value]) => `${label}:\n${value}`)
    .join("\n\n");
  const encodedSubject = encodeURIComponent(subject);
  const encodedBody = encodeURIComponent(body);
  return {
    subject,
    body,
    gmailUrl: `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(recipient)}&su=${encodedSubject}&body=${encodedBody}`,
    mailtoUrl: `mailto:${encodeURIComponent(recipient)}?subject=${encodedSubject}&body=${encodedBody}`
  };
}
