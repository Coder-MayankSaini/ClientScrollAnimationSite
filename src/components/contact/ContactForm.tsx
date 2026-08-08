import { useState } from "react";
import { useForm } from "react-hook-form";
import { Check, Copy, ExternalLink, Mail } from "lucide-react";
import { artist } from "../../data/artist";
import { buildEnquiryEmail, type EnquiryFormValues } from "../../lib/email";

type PreparedEmail = ReturnType<typeof buildEnquiryEmail>;

export function ContactForm() {
  const [prepared, setPrepared] = useState<PreparedEmail | null>(null);
  const [copyState, setCopyState] = useState<"idle" | "copied">("idle");
  const [popupBlocked, setPopupBlocked] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<EnquiryFormValues>({ mode: "onBlur" });

  const onSubmit = (values: EnquiryFormValues) => {
    if (values.website) return;
    const email = buildEnquiryEmail(values, artist.email);
    setPrepared(email);
    const popup = window.open(email.gmailUrl, "_blank", "noopener,noreferrer");
    setPopupBlocked(!popup);
    reset();
  };

  const copyMessage = async () => {
    if (!prepared) return;
    try {
      await navigator.clipboard.writeText(`Subject: ${prepared.subject}\n\n${prepared.body}`);
      setCopyState("copied");
      window.setTimeout(() => setCopyState("idle"), 2200);
    } catch {
      setCopyState("idle");
    }
  };

  return (
    <section className="contact-section section-band" id="contact" data-section="contact" aria-labelledby="contact-title">
      <div className="section-inner contact-layout">
        <div className="contact-intro">
          <span className="eyebrow">Start a conversation</span>
          <h2 id="contact-title">Bookings &amp; enquiries</h2>
          <p>Live performances, collaborations, media enquiries and partnerships.</p>
          <a className="contact-email" href={`mailto:${artist.email}`}><Mail size={16} />{artist.email}</a>
          <div className="contact-mark" aria-hidden="true">ML<span>06</span></div>
        </div>

        <div className="form-wrap">
          <form className="enquiry-form" onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="form-grid form-grid--two">
              <label>Full name <input {...register("fullName", { required: "Please enter your name." })} autoComplete="name" />{errors.fullName && <small>{errors.fullName.message}</small>}</label>
              <label>Email address <input type="email" {...register("email", { required: "Please enter your email.", pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Enter a valid email address." } })} autoComplete="email" />{errors.email && <small>{errors.email.message}</small>}</label>
            </div>
            <div className="form-grid form-grid--two">
              <label>Phone number <span className="optional">Optional</span><input {...register("phone")} autoComplete="tel" /></label>
              <label>Enquiry type <select {...register("enquiryType", { required: "Choose an enquiry type." })}><option value="">Select one</option><option>Live performance</option><option>Wedding or private event</option><option>Collaboration</option><option>Media or interview</option><option>Brand partnership</option><option>Other</option></select>{errors.enquiryType && <small>{errors.enquiryType.message}</small>}</label>
            </div>
            <div className="form-grid form-grid--two">
              <label>Event date <span className="optional">Optional</span><input type="date" {...register("eventDate")} /></label>
              <label>Event location <span className="optional">Optional</span><input {...register("eventLocation")} /></label>
            </div>
            <div className="form-grid form-grid--two">
              <label>Budget range <span className="optional">Optional</span><select {...register("budgetRange")}><option value="">Prefer not to say</option><option>Under ₹50,000</option><option>₹50,000 – ₹1,00,000</option><option>₹1,00,000 – ₹2,50,000</option><option>₹2,50,000+</option></select></label>
              <label>Subject <span className="optional">Optional</span><input {...register("subject")} /></label>
            </div>
            <label>Message <textarea rows={5} {...register("message", { required: "Please add a short message." })} />{errors.message && <small>{errors.message.message}</small>}</label>
            <label className="honeypot" aria-hidden="true">Website<input tabIndex={-1} autoComplete="off" {...register("website")} /></label>
            <label className="consent-label"><input type="checkbox" {...register("consent", { required: "Please confirm before continuing." })} /><span>I confirm that this enquiry can be shared with Mohit Ladhotiya for a reply.</span></label>
            {errors.consent && <small className="form-error">{errors.consent.message}</small>}
            <button type="submit" className="button button--solid button--submit" disabled={isSubmitting}>Prepare email <ExternalLink size={15} /></button>
          </form>

          {prepared && (
            <div className="form-success" role="status">
              <Check size={18} aria-hidden="true" />
              <div><strong>Your message has been prepared.</strong><p>Please review it and press Send in Gmail.</p></div>
              <div className="success-actions">
                {popupBlocked && <a className="button button--outline" href={prepared.gmailUrl} target="_blank" rel="noopener noreferrer">Open Gmail <ExternalLink size={14} /></a>}
                <a className="text-link" href={prepared.mailtoUrl}>Open email app <Mail size={14} /></a>
                <button type="button" className="text-link" onClick={copyMessage}>{copyState === "copied" ? <Check size={14} /> : <Copy size={14} />}{copyState === "copied" ? "Copied" : "Copy message"}</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
