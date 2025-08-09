import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Package,
  FileText,
  LogIn,
  LogOut,
  Shield,
  Menu,
  X,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import scoutHeroBg from "@/assets/scout-hero-bg.jpg";

const Header = () => {
  const location = useLocation();
  const { user, signOut, isAdmin } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    // Verificar posição inicial do scroll
    const initialScroll = window.scrollY;
    setIsScrolled(initialScroll > 100);

    let rafId: number;

    const handleScroll = () => {
      const scrollTop = window.scrollY;

      // Usar uma faixa maior para evitar piscar
      if (!isScrolled && scrollTop > 120) {
        setIsScrolled(true);
      } else if (isScrolled && scrollTop < 20) {
        setIsScrolled(false);
      }
    };

    const throttledHandleScroll = () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
      }

      rafId = requestAnimationFrame(handleScroll);
    };

    window.addEventListener("scroll", throttledHandleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", throttledHandleScroll);
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
    };
  }, [isScrolled]);

  const closeMenu = () => setIsMenuOpen(false);

  const NavigationItems = () => (
    <>
      <Button
        variant={location.pathname === "/" ? "secondary" : "ghost"}
        asChild
        className="w-full justify-start lg:w-auto lg:justify-center text-foreground lg:text-primary-foreground"
        onClick={closeMenu}
      >
        <Link to="/">
          <Package className="w-4 h-4 mr-2" />
          Estoque
        </Link>
      </Button>

      <Button
        variant={location.pathname === "/solicitar" ? "secondary" : "ghost"}
        asChild
        className="w-full justify-start lg:w-auto lg:justify-center text-foreground lg:text-primary-foreground"
        onClick={closeMenu}
      >
        <Link to="/solicitar">
          <FileText className="w-4 h-4 mr-2" />
          Solicitar Item
        </Link>
      </Button>

      {user && (
        <>
          <Button
            variant={location.pathname === "/cadastro" ? "secondary" : "ghost"}
            asChild
            className="w-full justify-start lg:w-auto lg:justify-center text-foreground lg:text-primary-foreground"
            onClick={closeMenu}
          >
            <Link to="/cadastro">
              <Plus className="w-4 h-4 mr-2" />
              Cadastrar Item
            </Link>
          </Button>

          {isAdmin && (
            <Button
              variant={
                location.pathname === "/admin/solicitacoes"
                  ? "secondary"
                  : "ghost"
              }
              asChild
              className="w-full justify-start lg:w-auto lg:justify-center text-foreground lg:text-primary-foreground"
              onClick={closeMenu}
            >
              <Link to="/admin/solicitacoes">
                <Shield className="w-4 h-4 mr-2" />
                Solicitações
              </Link>
            </Button>
          )}
        </>
      )}

      {user ? (
        <Button
          variant="outline"
          onClick={() => {
            signOut();
            closeMenu();
          }}
          className="w-full justify-start lg:w-auto lg:justify-center text-foreground lg:text-primary-foreground"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sair
        </Button>
      ) : (
        <Button
          variant={location.pathname === "/auth" ? "secondary" : "ghost"}
          asChild
          className="w-full justify-start lg:w-auto lg:justify-center text-foreground lg:text-primary-foreground"
          onClick={closeMenu}
        >
          <Link to="/auth">
            <LogIn className="w-4 h-4 mr-2" />
            Login
          </Link>
        </Button>
      )}
    </>
  );

  return (
    <header
      className={`sticky top-0 z-50 overflow-hidden transition-all duration-500 ease-out ${
        isScrolled
          ? "bg-scout-green shadow-lg"
          : "relative bg-gradient-to-r from-scout-green/95 to-scout-green-light/95 shadow-elegant"
      }`}
      style={
        !isScrolled
          ? {
              backgroundImage: `url(${scoutHeroBg})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundBlendMode: "overlay",
            }
          : {}
      }
    >
      {!isScrolled && (
        <div className="absolute inset-0 bg-scout-green/80"></div>
      )}
      <div
        className={`container mx-auto px-4 relative z-10 transition-all duration-300 ${
          isScrolled ? "py-2" : "py-4 lg:py-6"
        }`}
      >
        <div className="flex items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center space-x-2 lg:space-x-3 min-w-0 flex-1">
            <img
              src="/Logo.svg"
              alt="Logo"
              className={`flex-shrink-0 transition-all duration-300 ${
                isScrolled
                  ? "w-8 h-8 sm:w-10 sm:h-10"
                  : "w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20"
              }`}
            />
            <div className="min-w-0">
              <h1
                className={`font-bold text-primary-foreground truncate transition-all duration-300 ${
                  isScrolled
                    ? "text-sm sm:text-base lg:text-lg"
                    : "text-lg sm:text-xl lg:text-2xl"
                }`}
              >
                Grupo Escoteiro Arés
              </h1>
              {!isScrolled && (
                <p className="text-primary-foreground/80 text-xs sm:text-sm hidden sm:block">
                  Controle de Estoque
                </p>
              )}
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-2">
            <NavigationItems />
          </nav>

          {/* Mobile Menu Button */}
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size={isScrolled ? "sm" : "sm"}
                className="lg:hidden text-primary-foreground hover:bg-white/10"
              >
                <Menu
                  className={`transition-all duration-300 ${
                    isScrolled ? "h-4 w-4" : "h-5 w-5"
                  }`}
                />
                <span className="sr-only">Abrir menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] sm:w-[350px]">
              <SheetHeader>
                <SheetTitle className="text-left">Menu de Navegação</SheetTitle>
                <SheetDescription className="text-left">
                  Navegue pelas páginas do sistema
                </SheetDescription>
              </SheetHeader>
              <div className="flex flex-col space-y-3 mt-6">
                <NavigationItems />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;
