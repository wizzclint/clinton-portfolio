import { About } from "@/components/About";
import { Capabilities } from "@/components/Capabilities";
import { BackgroundDots, ScrollProgress, SideRails } from "@/components/Chrome";
import { CommandPalette } from "@/components/CommandPalette";
import { Contact, Footer } from "@/components/Contact";
import { Beyond, Credentials, Timeline } from "@/components/Credentials";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Terminal } from "@/components/Terminal";
import { ToolLab } from "@/components/ToolLab";
import { Flagship, Work } from "@/components/Work";

export default function Home() {
  return (
    <>
      <BackgroundDots />
      <ScrollProgress />
      <Header />
      <SideRails />
      <main>
        <Hero />
        <About />
        <Terminal />
        <Capabilities />
        <ToolLab />
        <Work />
        <Flagship />
        <Credentials />
        <Timeline />
        <Beyond />
        <Contact />
      </main>
      <Footer />
      <CommandPalette />
    </>
  );
}
