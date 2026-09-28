import Shell from "./components/shell";
import Hero from "./components/hero";
import Proof from "./components/proof";
import Capabilities from "./components/capabilities";
import Process from "./components/process";
import Contact from "./components/contact";

export default function Home() {
  return (
    <Shell>
      <Hero />
      <Proof />
      <Capabilities />
      <Process />
      <Contact />
    </Shell>
  );
}
