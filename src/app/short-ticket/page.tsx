import Image from "next/image";
import Link from "next/link";
import ShortTicketForm from "@/components/journey/ShortTicketForm";
import LeftPanel from "@/components/layout/LeftPanel";
import TrustedPartners from "@/components/layout/TrustedPartners";
import GradientBanner from "@/components/ui/GradientBanner";

export default function ShortTicketPage() {
  return (
    <>
      <div className="relative flex min-h-screen w-full flex-col overflow-hidden lg:flex-row">
        {/* extra blur glow effects */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {/* left yellow glow */}
          <div className="absolute left-[-180px] top-[20%] h-[380px] w-[380px] rounded-full bg-[#FEF3D5] blur-3xl" />

          {/* top purple glow */}
          <div className="absolute left-[30%] top-[-120px] h-[360px] w-[480px] rounded-full bg-violet-400/50 blur-3xl" />

          {/* bottom purple glow */}
          <div className="absolute bottom-[-180px] left-[10%] h-[500px] w-[500px] rounded-full bg-purple-300/30 blur-3xl" />

          {/* soft center white glow */}
          <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/20 blur-3xl" />

          {/* curved lines */}
          <div className="absolute bottom-[-120px] left-[-100px] h-[500px] w-[900px] rotate-6 rounded-[100%] border border-white/30" />
          <div className="absolute bottom-[-180px] left-[-140px] h-[600px] w-[1100px] rotate-6 rounded-[100%] border border-white/20" />

          {/* right yellow glow */}
          <div className="absolute right-[-300px] bottom-[-10%] h-[420px] w-[420px] rounded-full bg-[#f7e9c4] blur-3xl" />
        </div>

        {/* content */}
        <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col-reverse px-4 py-4 lg:flex-row lg:items-center lg:justify-center lg:gap-6 lg:px-6 lg:py-2 lg:min-h-screen 2xl:max-w-7xl 2xl:gap-10 2xl:px-10 3xl:max-w-400 3xl:gap-16">
          <LeftPanel />
          <ShortTicketForm />
          <div className="w-full lg:hidden mb-3 mt-4">
            <div className="flex justify-center mb-4">
              <Link href="https://www.cready.in/" target="_blank" rel="noreferrer">
                <Image src="/cready.png" alt="Cready" width={120} height={32} className="h-8 w-auto" />
              </Link>
            </div>
            <TrustedPartners />
          </div>
        </div>
      </div>
      <GradientBanner />
    </>
  );
}
