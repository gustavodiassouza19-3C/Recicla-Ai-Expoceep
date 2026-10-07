<dependency>
@/app/login/page.tsx - [LoginPage]
    - import { ArrowLeft } from "lucide-react";
    - import { animate } from "animejs";
    - const BackToLoginLink = () => (
        <div className="mt-6">
          <Link href="/login" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Voltar ao login
          </Link>
        </div>
      );
    - <p className="text-sm text-muted-foreground">
        <Link href="/como-funciona" className="...">Como funciona?</Link>
      </p>
    </div>
    - <BackToLoginLink />
  </div>
</dependency>

<dependency>
@/app/about/page.tsx - AboutPage
    - <Link href="/" className="..."><ArrowLeft /> Voltar para o início</Link>
</dependency>
