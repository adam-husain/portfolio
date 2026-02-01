"use client";

import { useState, FormEvent } from "react";
import Image from "next/image";
import { socialLinks } from "@/lib/site";
import posthog from "posthog-js";

// ============================================================
// FOOTER SECTION: CONTACT & SOCIAL
// ============================================================
// Visual elements:
// - Full black background for distinct footer
// - Two-column layout: profile/social + contact form
// - Primary color accents (#fca311)
//
// Design notes:
// - Form submits to Formspree
// - Square profile photo with rounded corners and thick border
// - Social links as name placards in bottom right of profile
// ============================================================

type FormStatus = "idle" | "loading" | "success" | "error";

export default function FooterSection() {
  const [formStatus, setFormStatus] = useState<FormStatus>("idle");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormStatus("loading");

    try {
      const response = await fetch("https://formspree.io/f/xlgljvjk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setFormStatus("success");
        setFormData({ name: "", email: "", message: "" });

        // Track successful form submission
        posthog.capture("contact_form_submitted", {
          message_length: formData.message.length,
        });
      } else {
        setFormStatus("error");

        // Track form submission error
        posthog.capture("contact_form_error", {
          error_type: "response_not_ok",
          status_code: response.status,
        });
      }
    } catch (error) {
      setFormStatus("error");

      // Track form submission error and capture exception
      posthog.capture("contact_form_error", {
        error_type: "network_error",
      });
      posthog.captureException(error);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Reset status when user starts typing again
    if (formStatus === "success" || formStatus === "error") {
      setFormStatus("idle");
    }
  };

  return (
    <footer
      id="footer-section"
      aria-label="Contact and Social Links"
      style={{
        position: "relative",
        zIndex: 10,
        backgroundColor: "#000000",
        padding: "4rem 1.5rem",
      }}
    >
      <div style={{ maxWidth: "72rem", margin: "0 auto" }}>
        <div className="footer-grid">
          {/* Left Column: Profile + Social */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* Profile Photo Container */}
            <div style={{ position: "relative", marginBottom: "2rem" }}>
              {/* Profile Photo - Square with rounded corners */}
              <div
                style={{
                  width: "256px",
                  height: "256px",
                  borderRadius: "16px",
                  overflow: "hidden",
                  border: "3px solid #fca311",
                  boxShadow: "0 0 40px rgba(252, 163, 17, 0.3)",
                }}
                className="w-48 h-48 md:w-64 md:h-64"
              >
                <Image
                  src="/images/mine/profile.jpg"
                  alt="Adam Husain"
                  width={256}
                  height={256}
                  style={{
                    width: "120%",
                    height: "140%",
                    transform: "translateY(-10%)",
                    objectFit: "cover",
                  }}
                  priority
                />
              </div>

              {/* Social Links - Name Placards */}
              <div
                style={{
                  position: "absolute",
                  bottom: "-24px",
                  right: "16px",
                  display: "flex",
                  gap: "8px",
                }}
              >
                {/* LinkedIn Placard */}
                <a
                  href={socialLinks.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn Profile"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "48px",
                    height: "48px",
                    backgroundColor: "#22223b",
                    border: "3px solid #fca311",
                    borderRadius: "8px",
                    transition: "all 0.2s ease",
                  }}
                  onClick={() => {
                    posthog.capture("social_link_clicked", {
                      platform: "linkedin",
                      link_url: socialLinks.linkedin,
                    });
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#fca311";
                    const svg = e.currentTarget.querySelector("svg");
                    if (svg) svg.style.color = "#22223b";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#22223b";
                    const svg = e.currentTarget.querySelector("svg");
                    if (svg) svg.style.color = "#ffffff";
                  }}
                >
                  <svg
                    style={{ width: "24px", height: "24px", color: "#ffffff", transition: "color 0.2s ease" }}
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </a>

                {/* GitHub Placard */}
                <a
                  href={socialLinks.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="GitHub Profile"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "48px",
                    height: "48px",
                    backgroundColor: "#22223b",
                    border: "3px solid #fca311",
                    borderRadius: "8px",
                    transition: "all 0.2s ease",
                  }}
                  onClick={() => {
                    posthog.capture("social_link_clicked", {
                      platform: "github",
                      link_url: socialLinks.github,
                    });
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#fca311";
                    const svg = e.currentTarget.querySelector("svg");
                    if (svg) svg.style.color = "#22223b";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#22223b";
                    const svg = e.currentTarget.querySelector("svg");
                    if (svg) svg.style.color = "#ffffff";
                  }}
                >
                  <svg
                    style={{ width: "24px", height: "24px", color: "#ffffff", transition: "color 0.2s ease" }}
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div>
            <h2
              style={{
                color: "#ffffff",
                fontSize: "1.875rem",
                fontWeight: "bold",
                marginBottom: "2rem",
              }}
            >
              Contact Me
            </h2>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              {/* Name Input */}
              <div>
                <label
                  htmlFor="name"
                  style={{
                    display: "block",
                    color: "rgba(255, 255, 255, 0.8)",
                    marginBottom: "0.5rem",
                    fontSize: "0.875rem",
                  }}
                >
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  disabled={formStatus === "loading"}
                  placeholder="Your name"
                  style={{
                    width: "100%",
                    padding: "0.75rem 1rem",
                    backgroundColor: "rgba(255, 255, 255, 0.05)",
                    border: "2px solid rgba(255, 255, 255, 0.2)",
                    borderRadius: "8px",
                    color: "#ffffff",
                    fontSize: "1rem",
                    outline: "none",
                    transition: "border-color 0.2s ease",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "#fca311";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.2)";
                  }}
                />
              </div>

              {/* Email Input */}
              <div>
                <label
                  htmlFor="email"
                  style={{
                    display: "block",
                    color: "rgba(255, 255, 255, 0.8)",
                    marginBottom: "0.5rem",
                    fontSize: "0.875rem",
                  }}
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={formStatus === "loading"}
                  placeholder="your@email.com"
                  style={{
                    width: "100%",
                    padding: "0.75rem 1rem",
                    backgroundColor: "rgba(255, 255, 255, 0.05)",
                    border: "2px solid rgba(255, 255, 255, 0.2)",
                    borderRadius: "8px",
                    color: "#ffffff",
                    fontSize: "1rem",
                    outline: "none",
                    transition: "border-color 0.2s ease",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "#fca311";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.2)";
                  }}
                />
              </div>

              {/* Message Textarea */}
              <div>
                <label
                  htmlFor="message"
                  style={{
                    display: "block",
                    color: "rgba(255, 255, 255, 0.8)",
                    marginBottom: "0.5rem",
                    fontSize: "0.875rem",
                  }}
                >
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={5}
                  value={formData.message}
                  onChange={handleInputChange}
                  disabled={formStatus === "loading"}
                  placeholder="What would you like to say?"
                  style={{
                    width: "100%",
                    padding: "0.75rem 1rem",
                    backgroundColor: "rgba(255, 255, 255, 0.05)",
                    border: "2px solid rgba(255, 255, 255, 0.2)",
                    borderRadius: "8px",
                    color: "#ffffff",
                    fontSize: "1rem",
                    outline: "none",
                    resize: "none",
                    transition: "border-color 0.2s ease",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "#fca311";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.2)";
                  }}
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={formStatus === "loading"}
                style={{
                  width: "100%",
                  padding: "0.75rem 1.5rem",
                  backgroundColor: "#fca311",
                  color: "#22223b",
                  fontWeight: "600",
                  fontSize: "1rem",
                  borderRadius: "8px",
                  border: "none",
                  cursor: formStatus === "loading" ? "not-allowed" : "pointer",
                  opacity: formStatus === "loading" ? 0.5 : 1,
                  transition: "opacity 0.2s ease",
                }}
              >
                {formStatus === "loading" ? "Sending..." : "Send Message"}
              </button>

              {/* Status Messages */}
              {formStatus === "success" && (
                <p style={{ color: "#4ade80", textAlign: "center" }}>
                  Message sent successfully! I&apos;ll get back to you soon.
                </p>
              )}
              {formStatus === "error" && (
                <p style={{ color: "#f87171", textAlign: "center" }}>
                  Something went wrong. Please try again.
                </p>
              )}
            </form>
          </div>
        </div>

        {/* Copyright */}
        <div
          style={{
            marginTop: "4rem",
            paddingTop: "2rem",
            borderTop: "1px solid rgba(255, 255, 255, 0.1)",
            textAlign: "center",
          }}
        >
          <p style={{ color: "rgba(255, 255, 255, 0.4)", fontSize: "0.875rem" }}>
            {new Date().getFullYear()} Adam Husain. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
