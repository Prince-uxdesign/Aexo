import { Building2, Camera, Handshake, PenTool, Sparkles, Users, Wrench } from "lucide-react";
import { iconSize, iconStroke } from "@/components/ui";

const audiences = [
  {
    icon: PenTool,
    name: "Freelancers",
    body: "Bill clients for fixed project sprints, hourly time, or recurring monthly retainers.",
  },
  {
    icon: Users,
    name: "Agencies & Studios",
    body: "Itemize deliverables, phase milestones, and team expenses with transparent tax breakdowns.",
  },
  {
    icon: Handshake,
    name: "Consultants & Advisors",
    body: "Invoice by the advisory engagement, day rate, or milestone with custom payment terms.",
  },
  {
    icon: Camera,
    name: "Creators & Media",
    body: "Bill sponsors and brands for media licensing, sponsored content, and usage rights.",
  },
  {
    icon: Wrench,
    name: "Service Providers",
    body: "Charge for jobs, labor, materials, and call-outs with instant mobile client delivery.",
  },
  {
    icon: Building2,
    name: "Modern Companies",
    body: "Send clean, audit-compliant invoices with unique reference IDs and multi-currency support.",
  },
];

const commitments = [
  {
    title: "Zero Account Lock-in",
    body: "Create, preview, download and print without creating an account or providing a credit card.",
  },
  {
    title: "Instant Delivery",
    body: "Download print-ready vector PDFs or share a lightweight link that renders crisply on any device.",
  },
  {
    title: "Save When You Want",
    body: "Create a free account whenever you want to track payment statuses, manage drafts, and keep historical records.",
  },
];

export function Audiences() {
  return (
    <section
      id="who-its-for"
      aria-labelledby="audiences-title"
      className="bg-[#f8fafc]/60 py-20 sm:py-28"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="mx-auto mb-16 max-w-3xl text-center sm:mb-20">
          <div className="bg-blue-calm-100 text-xs font-semibold text-blue-calm-800 shadow-2xs mb-4 inline-flex items-center gap-2 rounded-full px-4 py-1.5">
            <Sparkles size={13} className="text-blue-calm-600" />
            Designed for Modern Work
          </div>
          <h2
            id="audiences-title"
            className="text-3xl text-gray-900 sm:text-4xl md:text-5xl font-medium tracking-tight"
          >
            Made for anyone who bills for their work.
          </h2>
          <p className="text-base sm:text-lg text-gray-500 mt-4">
            Whether you send one invoice a month or fifty a week, your invoices should look as
            considered as the work behind them.
          </p>
        </div>

        {/* 6 Audience Cards - Soft shadows, zero strokes */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {audiences.map(({ icon: Icon, name, body }) => (
            <div
              key={name}
              className="flex flex-col justify-between rounded-[2.5rem] bg-white p-9 shadow-[0_15px_40px_rgba(0,0,0,0.05)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_25px_50px_rgba(20,40,70,0.09)]"
            >
              <div>
                <span className="bg-blue-calm-50 text-blue-calm-700 shadow-xs mb-6 flex size-14 items-center justify-center rounded-2xl">
                  <Icon size={iconSize.md} strokeWidth={iconStroke} />
                </span>
                <h3 className="text-xl font-semibold text-gray-900">{name}</h3>
                <p className="text-sm text-gray-500 mt-3 leading-relaxed">{body}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Product Commitments */}
        <div className="border-gray-100 mt-20 grid grid-cols-1 gap-10 border-t pt-14 md:grid-cols-3">
          {commitments.map((item) => (
            <div
              key={item.title}
              className="border-blue-calm-400 flex flex-col gap-2.5 border-l-2 pl-6"
            >
              <h3 className="text-base font-semibold text-gray-900">{item.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{item.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
