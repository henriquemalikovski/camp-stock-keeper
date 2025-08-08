import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus, Package } from "lucide-react";
import scoutHeroBg from "@/assets/scout-hero-bg.jpg";
const Header = () => {
  const location = useLocation();
  return <header className="relative bg-gradient-to-r from-scout-green/95 to-scout-green-light/95 shadow-elegant overflow-hidden" style={{
    backgroundImage: `url(${scoutHeroBg})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundBlendMode: "overlay"
  }}>
      <div className="absolute inset-0 bg-scout-green/80"></div>
      <div className="container mx-auto px-4 py-6 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* <Package className="w-8 h-8 text-primary-foreground" /> */}

            <img src="/Logo.svg" alt="" className="w-20 h-20" />
            <div>
              <h1 className="text-2xl font-bold text-primary-foreground">Grupo Escoteiro Arés</h1>
              <p className="text-primary-foreground/80 text-sm">Controle de Estoque</p>
            </div>
          </div>

          <nav className="flex items-center space-x-4">
            <Button variant={location.pathname === "/" ? "secondary" : "default"} asChild
          // className={
          //   location.pathname === "/"
          //     ? ""
          //     : "border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10"
          // }
          >
              <Link to="/">
                <Package className="w-4 h-4 mr-2" />
                Estoque
              </Link>
            </Button>

            <Button variant={location.pathname === "/cadastro" ? "secondary" : "default"} asChild
          // className={
          //   location.pathname === "/cadastro"
          //     ? ""
          //     : "border-primary-foreground/20  hover:bg-primary-foreground/10"
          // }
          >
              <Link to="/cadastro">
                <Plus className="w-4 h-4 mr-2" />
                Cadastrar Item
              </Link>
            </Button>
          </nav>
        </div>
      </div>
    </header>;
};
export default Header;