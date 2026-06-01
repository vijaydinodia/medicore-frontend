import { Link } from "react-router-dom";
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import GavelRoundedIcon from "@mui/icons-material/GavelRounded";
import LocalHospitalRoundedIcon from "@mui/icons-material/LocalHospitalRounded";
import PaymentsRoundedIcon from "@mui/icons-material/PaymentsRounded";
import PrivacyTipRoundedIcon from "@mui/icons-material/PrivacyTipRounded";

const pageContent = {
  contact: {
    eyebrow: "Support",
    title: "Contact Us",
    subtitle: "Reach the MediCore team for hospital onboarding, appointment help, and account support.",
    icon: EmailRoundedIcon,
    sections: [
      {
        title: "How We Can Help",
        body: [
          "Patients can contact us for appointment booking support, profile help, and general service questions.",
          "Hospitals, doctors, labs, and medical stores can reach out for onboarding, dashboard support, and listing updates.",
        ],
      },
      {
        title: "Contact Details",
        body: [
          "Email: vijaydinodia548@gmail.com",
          "Phone: 8854823204",
          "Hours: Monday to Saturday, 9:00 AM to 6:00 PM",
        ],
      },
      {
        title: "Office Address",
        body: ["MediCore Health Network, India"],
      },
    ],
  },
  privacy: {
    eyebrow: "Data Protection",
    title: "Privacy Policy",
    subtitle: "This policy explains how MediCore handles account, hospital, appointment, and service information.",
    icon: PrivacyTipRoundedIcon,
    sections: [
      {
        title: "Information We Collect",
        body: [
          "We may collect profile details, contact information, appointment records, hospital details, doctor details, lab test details, and medical store information that users submit through the platform.",
          "We may also collect technical information such as device details, browser type, and usage activity to improve reliability and security.",
        ],
      },
      {
        title: "How We Use Information",
        body: [
          "We use information to create accounts, manage bookings, show hospital and doctor listings, process service requests, provide support, and protect the platform from misuse.",
          "We do not sell personal information. Data is shared only where needed to provide requested services, meet legal duties, or protect users and the platform.",
        ],
      },
      {
        title: "Your Choices",
        body: [
          "Users may request correction or deletion of their account information where applicable.",
          "Some records may be retained when required for legal, security, operational, or dispute-resolution purposes.",
        ],
      },
    ],
  },
  terms: {
    eyebrow: "Platform Rules",
    title: "Terms & Conditions",
    subtitle: "These terms describe the responsibilities of users, providers, and MediCore while using the platform.",
    icon: GavelRoundedIcon,
    sections: [
      {
        title: "Use Of The Platform",
        body: [
          "Users agree to provide accurate information and use MediCore only for lawful healthcare discovery, appointment, lab, and medical store related purposes.",
          "Hospitals, doctors, labs, and medical stores are responsible for keeping their listings, services, availability, and pricing information accurate.",
        ],
      },
      {
        title: "Healthcare Disclaimer",
        body: [
          "MediCore helps users discover and connect with healthcare providers. It does not replace professional medical advice, diagnosis, emergency care, or treatment.",
          "Users should contact a qualified healthcare professional or emergency service for urgent medical needs.",
        ],
      },
      {
        title: "Account Responsibility",
        body: [
          "Users are responsible for maintaining the confidentiality of their login details and for all actions performed through their account.",
          "MediCore may restrict accounts or listings that violate these terms, misuse the platform, or create safety or security risks.",
        ],
      },
    ],
  },
  refund: {
    eyebrow: "Payments",
    title: "Refund Policy",
    subtitle: "This policy explains how refunds may be handled for paid services made through MediCore.",
    icon: PaymentsRoundedIcon,
    sections: [
      {
        title: "Refund Eligibility",
        body: [
          "Refunds may be considered when a paid appointment, lab test, or service is cancelled according to the provider's cancellation rules.",
          "Refund eligibility may depend on service status, provider policy, cancellation timing, and payment gateway rules.",
        ],
      },
      {
        title: "Processing Timeline",
        body: [
          "Approved refunds are usually initiated to the original payment method.",
          "Bank or payment gateway processing may take 5 to 10 business days after refund approval.",
        ],
      },
      {
        title: "Non-Refundable Cases",
        body: [
          "Completed services, missed appointments, late cancellations, incorrect user details, or provider-specific non-refundable services may not qualify for a refund.",
          "For refund help, contact MediCore support with your booking or payment reference.",
        ],
      },
    ],
  },
};

const StaticInfoPage = ({ type }) => {
  const page = pageContent[type] || pageContent.contact;
  const Icon = page.icon || LocalHospitalRoundedIcon;

  return (
    <main className="min-h-[calc(100svh-73px)] px-4 py-8 sm:px-6 lg:py-12">
      <section className="mx-auto max-w-5xl">
        <div className="medicore-gradient overflow-hidden p-6 sm:p-8 lg:p-10">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-3xl">
              <p className="text-sm font-black uppercase tracking-[0.2em] text-teal-100">{page.eyebrow}</p>
              <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">{page.title}</h1>
              <p className="mt-4 max-w-2xl text-base font-medium leading-7 text-teal-50">{page.subtitle}</p>
            </div>
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-white/14 ring-1 ring-white/20">
              <Icon className="!h-9 !w-9" aria-hidden="true" />
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4">
          {page.sections.map((section) => (
            <article key={section.title} className="medicore-card rounded-lg p-5 sm:p-6">
              <h2 className="text-xl font-black text-slate-950 dark:text-white">{section.title}</h2>
              <div className="mt-3 space-y-3 text-sm font-medium leading-6 text-slate-600 dark:text-slate-300 sm:text-base">
                {section.body.map((item) => (
                  <p key={item}>{item}</p>
                ))}
              </div>
            </article>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            to="/contact-us"
            className="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-bold text-teal-800 transition hover:bg-teal-50 dark:text-teal-200 dark:hover:bg-teal-950/50"
          >
            Contact Support
          </Link>
          <Link
            to="/"
            className="medicore-button-primary inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-bold"
          >
            Back To Home
          </Link>
        </div>
      </section>
    </main>
  );
};

export const ContactUs = () => <StaticInfoPage type="contact" />;
export const PrivacyPolicy = () => <StaticInfoPage type="privacy" />;
export const TermsConditions = () => <StaticInfoPage type="terms" />;
export const RefundPolicy = () => <StaticInfoPage type="refund" />;
