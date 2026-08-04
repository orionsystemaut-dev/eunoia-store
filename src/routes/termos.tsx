import { createFileRoute } from "@tanstack/react-router";
import { StoreShell } from "@/components/shop/StoreShell";

export const Route = createFileRoute("/termos")({
  component: Termos,
});

function Termos() {
  return (
    <StoreShell>
      <div className="mx-auto max-w-3xl px-4 py-14 lg:py-20 lg:px-8">
        <h1 className="font-display text-4xl font-bold">Termos de Uso e Privacidade</h1>
        <p className="mt-4 text-muted-foreground">Última atualização: {new Date().toLocaleDateString("pt-BR")}</p>
        
        <div className="prose prose-sm dark:prose-invert mt-10 max-w-none space-y-6 text-muted-foreground leading-relaxed">
          <section>
            <h2 className="font-display text-xl font-semibold text-foreground">1. Termos</h2>
            <p>
              Ao acessar ao site Orion Store, concorda em cumprir estes termos de serviço, 
              todas as leis e regulamentos aplicáveis ​​e concorda que é responsável pelo cumprimento 
              de todas as leis locais aplicáveis. Se você não concordar com algum desses termos, 
              está proibido de usar ou acessar este site.
            </p>
          </section>
          
          <section>
            <h2 className="font-display text-xl font-semibold text-foreground">2. Proteção de Dados e LGPD</h2>
            <p>
              Em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018), garantimos 
              que os dados pessoais fornecidos (tais como Nome, CPF, Telefone, Endereço e E-mail) são 
              armazenados de forma criptografada de ponta a ponta em nossos bancos de dados (AES-256).
            </p>
            <p>
              Suas senhas são armazenadas exclusivamente utilizando algoritmos irreversíveis (Hash SHA-256), 
              de modo que nem mesmo nossos administradores possuem acesso à sua senha original.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-foreground">3. Uso de Informações</h2>
            <p>
              As informações coletadas são utilizadas exclusivamente para o processamento de pedidos, 
              faturamento, emissão de notas fiscais e entrega de produtos. Não vendemos, alugamos ou 
              compartilhamos seus dados com terceiros para fins de marketing sem seu consentimento explícito.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-foreground">4. Modificações</h2>
            <p>
              A Orion Store pode revisar estes termos de serviço do site a qualquer momento, sem aviso prévio. 
              Ao usar este site, você concorda em ficar vinculado à versão atual desses termos de serviço.
            </p>
          </section>
        </div>
      </div>
    </StoreShell>
  );
}
