import { useState } from "react";

const initialForm = {
  name: "",
  email: "",
  phone: "",
  company: "",
  country: "",
  product: "",
  message: "",
  website: "",
  captchaCheck: false,
};

export default function InquiryForm({ endpoint = "/api/inquiry" }) {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ type: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({ ...current, [name]: type === "checkbox" ? checked : value }));
    setErrors((current) => ({ ...current, [name]: "" }));
  };

  const validate = () => {
    const nextErrors = {};
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    const phonePattern = /^\+?[0-9\s().-]{7,24}$/;

    if (!form.name.trim()) nextErrors.name = "Please enter your name.";
    if (!form.email.trim()) nextErrors.email = "Please enter your email address.";
    else if (!emailPattern.test(form.email.trim())) nextErrors.email = "Please enter a valid email address.";
    if (!form.phone.trim()) nextErrors.phone = "Please enter your phone number.";
    else if (!phonePattern.test(form.phone.trim())) nextErrors.phone = "Please enter a valid international phone number.";
    if (!form.captchaCheck) nextErrors.captchaCheck = "Please confirm this is a real business inquiry.";
    if (form.website) nextErrors.website = "Spam submission blocked.";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const submitForm = async (event) => {
    event.preventDefault();
    setStatus({ type: "", message: "" });

    if (!validate()) {
      setStatus({ type: "error", message: "Please complete the required fields before submitting." });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!response.ok) throw new Error("Submission failed");
      setForm(initialForm);
      setStatus({ type: "success", message: "Thank you. Your inquiry has been submitted successfully." });
    } catch {
      setStatus({
        type: "error",
        message: "Submission failed. Please email davidsha@zaihaisurfing.com or contact us on WhatsApp.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="inquiry-form" onSubmit={submitForm} noValidate>
      <input
        className="anti-spam-field"
        type="text"
        name="website"
        value={form.website}
        onChange={updateField}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
      />

      <div className="form-grid">
        <Field label="Name" name="name" required error={errors.name}>
          <input name="name" value={form.name} onChange={updateField} placeholder="Your full name" autoComplete="name" />
        </Field>
        <Field label="Email" name="email" required error={errors.email}>
          <input name="email" type="email" value={form.email} onChange={updateField} placeholder="name@company.com" autoComplete="email" />
        </Field>
        <Field label="Phone" name="phone" required error={errors.phone}>
          <input name="phone" type="tel" value={form.phone} onChange={updateField} placeholder="+971 50 123 4567" autoComplete="tel" />
        </Field>
        <Field label="Company" name="company" error={errors.company}>
          <input name="company" value={form.company} onChange={updateField} placeholder="Company name" autoComplete="organization" />
        </Field>
        <Field label="Country / Region" name="country" error={errors.country}>
          <input name="country" value={form.country} onChange={updateField} placeholder="UAE, Saudi Arabia, Nigeria..." autoComplete="country-name" />
        </Field>
        <Field label="Product Requirement" name="product" error={errors.product}>
          <select name="product" value={form.product} onChange={updateField}>
            <option value="">Select a product</option>
            <option>ZAIHAI X1 Electric Surfboard</option>
            <option>ZAIHAI X1 Pro Electric Surfboard</option>
            <option>Rage Shark X Electric Kart Boat</option>
            <option>ZAIHAI P1 Fuel-Powered Surfboard</option>
            <option>ZAIHAI P1 Pro Fuel-Powered Surfboard</option>
            <option>OEM/ODM Customization</option>
            <option>Distributor Cooperation</option>
          </select>
        </Field>
        <Field className="full" label="Message" name="message" error={errors.message}>
          <textarea
            name="message"
            rows={5}
            value={form.message}
            onChange={updateField}
            placeholder="Tell us your quantity, use case, destination port, or project details."
          />
        </Field>
      </div>

      <div className={`form-consent ${errors.captchaCheck ? "is-invalid" : ""}`}>
        <label>
          <input name="captchaCheck" type="checkbox" checked={form.captchaCheck} onChange={updateField} />
          <span>
            I confirm this is a real business inquiry. <strong>*</strong>
          </span>
        </label>
        <small>{errors.captchaCheck || "Simple anti-spam confirmation. Replace with reCAPTCHA/Turnstile if needed."}</small>
      </div>

      <button className="button primary inquiry-submit" type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Sending..." : "Send Inquiry"}
      </button>
      <p className={`inquiry-status ${status.type}`} role="status" aria-live="polite">
        {status.message}
      </p>
    </form>
  );
}

function Field({ label, name, required, error, className = "", children }) {
  return (
    <label className={`field ${className} ${error ? "is-invalid" : ""}`}>
      <span>
        {label} {required ? <strong>*</strong> : null}
      </span>
      {children}
      <small>{error || (required ? "Required" : "Optional")}</small>
    </label>
  );
}
