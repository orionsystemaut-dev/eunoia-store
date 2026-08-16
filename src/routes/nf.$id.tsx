import { createFileRoute } from "@tanstack/react-router";
import { useShop } from "@/lib/shop-store";
import { brl } from "@/lib/shop-data";
import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/nf/$id")({
  component: NfViewer,
});

function NfViewer() {
  const { id } = Route.useParams();
  const { orders, siteConfig } = useShop();
  const order = orders.find((o) => o.id === id);

  if (!order) {
    return (
      <div className="flex h-screen w-screen items-center justify-center font-sans">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Documento não encontrado</h1>
          <p className="text-muted-foreground mt-2">A nota fiscal solicitada não existe ou foi excluída.</p>
        </div>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8 print:p-0 print:bg-white flex flex-col items-center">
      
      {/* Floating Action Bar - Hidden on print */}
      <div className="mb-8 flex gap-4 print:hidden sticky top-4 bg-white p-4 rounded-xl shadow-lg border border-border">
        <Button onClick={handlePrint} className="gap-2">
          <Printer className="w-4 h-4" /> Imprimir / Salvar PDF
        </Button>
      </div>

      {/* DANFE Document Container */}
      <div className="w-[210mm] min-h-[297mm] bg-white p-[10mm] shadow-xl print:shadow-none print:w-full print:h-full border border-gray-300 print:border-none font-sans text-[10px]">
        
        {/* Header Table */}
        <table className="w-full border-collapse border border-black mb-2">
          <tbody>
            <tr>
              <td className="w-[50%] border-r border-black p-2 text-center" rowSpan={3}>
                <div className="flex flex-col items-center justify-center h-full">
                  {siteConfig.logoUrl ? (
                    <img src={siteConfig.logoUrl} alt="Logo" className="max-h-16 mb-2 grayscale" />
                  ) : null}
                  <p className="font-bold text-sm uppercase">{siteConfig.storeName}</p>
                  <p className="text-xs">Rua Exemplo, 123 - Centro<br/>São Paulo - SP<br/>CNPJ: 00.000.000/0001-00</p>
                </div>
              </td>
              <td className="w-[20%] border-r border-black p-2 text-center" rowSpan={3}>
                <p className="font-bold text-lg">DANFE</p>
                <p className="text-xs mt-1">Documento Auxiliar da<br/>Nota Fiscal Eletrônica</p>
                <p className="mt-2 text-[10px]">0 - ENTRADA<br/>1 - SAÍDA</p>
                <div className="border border-black inline-block px-2 py-1 mt-1 font-bold">1</div>
              </td>
              <td className="w-[30%] border-b border-black p-2 align-top">
                <p className="uppercase font-bold text-[8px] mb-1">Chave de Acesso</p>
                <p className="font-mono text-xs font-bold text-center">3526 0800 0000 0000 0100 5500 0000 0000 0100</p>
              </td>
            </tr>
            <tr>
              <td className="border-b border-black p-2 text-center align-top">
                <p className="text-[10px]">Consulta de autenticidade no portal nacional da NF-e<br/>www.nfe.fazenda.gov.br/portal ou no site da Sefaz Autorizadora</p>
              </td>
            </tr>
            <tr>
              <td className="p-2 align-top">
                <p className="uppercase font-bold text-[8px] mb-1">Protocolo de Autorização de Uso</p>
                <p className="font-mono text-xs">135260000000001 - {new Date(order.date).toLocaleDateString("pt-BR")}</p>
              </td>
            </tr>
          </tbody>
        </table>

        {/* Natureza da Operação */}
        <table className="w-full border-collapse border border-black mb-2">
          <tbody>
            <tr>
              <td className="w-[60%] border-r border-black p-1 align-top">
                <p className="uppercase font-bold text-[8px]">Natureza da Operação</p>
                <p className="text-xs">Venda de Mercadorias</p>
              </td>
              <td className="w-[20%] border-r border-black p-1 align-top">
                <p className="uppercase font-bold text-[8px]">Inscrição Estadual</p>
                <p className="text-xs">111.111.111.111</p>
              </td>
              <td className="w-[20%] p-1 align-top">
                <p className="uppercase font-bold text-[8px]">CNPJ</p>
                <p className="text-xs">00.000.000/0001-00</p>
              </td>
            </tr>
          </tbody>
        </table>

        {/* Destinatário/Remetente */}
        <p className="font-bold text-[10px] mb-1">DESTINATÁRIO / REMETENTE</p>
        <table className="w-full border-collapse border border-black mb-2">
          <tbody>
            <tr>
              <td className="w-[60%] border-r border-b border-black p-1 align-top">
                <p className="uppercase font-bold text-[8px]">Nome/Razão Social</p>
                <p className="text-xs">{order.customerName}</p>
              </td>
              <td className="w-[25%] border-r border-b border-black p-1 align-top">
                <p className="uppercase font-bold text-[8px]">CNPJ/CPF</p>
                <p className="text-xs">{order.customerDoc ?? "000.000.000-00"}</p>
              </td>
              <td className="w-[15%] border-b border-black p-1 align-top">
                <p className="uppercase font-bold text-[8px]">Data de Emissão</p>
                <p className="text-xs">{new Date(order.date).toLocaleDateString("pt-BR")}</p>
              </td>
            </tr>
            <tr>
              <td className="border-r border-b border-black p-1 align-top" colSpan={2}>
                <p className="uppercase font-bold text-[8px]">Endereço</p>
                <p className="text-xs">{order.customerAddress ?? "Endereço não informado"}</p>
              </td>
              <td className="border-b border-black p-1 align-top">
                <p className="uppercase font-bold text-[8px]">Data Entrada/Saída</p>
                <p className="text-xs">{new Date(order.date).toLocaleDateString("pt-BR")}</p>
              </td>
            </tr>
          </tbody>
        </table>

        {/* Cálculo do Imposto */}
        <p className="font-bold text-[10px] mb-1">CÁLCULO DO IMPOSTO</p>
        <table className="w-full border-collapse border border-black mb-2 text-right">
          <tbody>
            <tr>
              <td className="w-[14%] border-r border-b border-black p-1 align-top">
                <p className="uppercase font-bold text-[8px] text-left">Base Calc. ICMS</p>
                <p className="text-xs text-right">0,00</p>
              </td>
              <td className="w-[14%] border-r border-b border-black p-1 align-top">
                <p className="uppercase font-bold text-[8px] text-left">Valor do ICMS</p>
                <p className="text-xs text-right">0,00</p>
              </td>
              <td className="w-[14%] border-r border-b border-black p-1 align-top">
                <p className="uppercase font-bold text-[8px] text-left">Base Calc. ICMS Subst.</p>
                <p className="text-xs text-right">0,00</p>
              </td>
              <td className="w-[14%] border-r border-b border-black p-1 align-top">
                <p className="uppercase font-bold text-[8px] text-left">Valor ICMS Subst.</p>
                <p className="text-xs text-right">0,00</p>
              </td>
              <td className="w-[14%] border-r border-b border-black p-1 align-top">
                <p className="uppercase font-bold text-[8px] text-left">V. Aprox. Tributos</p>
                <p className="text-xs text-right">{brl((order.subtotal ?? 0) * 0.18)}</p>
              </td>
              <td className="w-[30%] border-b border-black p-1 align-top" colSpan={2}>
                <p className="uppercase font-bold text-[8px] text-left">Valor Total dos Produtos</p>
                <p className="text-xs text-right font-bold">{brl(order.subtotal ?? 0)}</p>
              </td>
            </tr>
            <tr>
              <td className="w-[14%] border-r border-black p-1 align-top">
                <p className="uppercase font-bold text-[8px] text-left">Valor do Frete</p>
                <p className="text-xs text-right">{brl(order.shipping ?? 0)}</p>
              </td>
              <td className="w-[14%] border-r border-black p-1 align-top">
                <p className="uppercase font-bold text-[8px] text-left">Valor do Seguro</p>
                <p className="text-xs text-right">0,00</p>
              </td>
              <td className="w-[14%] border-r border-black p-1 align-top">
                <p className="uppercase font-bold text-[8px] text-left">Desconto</p>
                <p className="text-xs text-right">{brl(order.discount ?? 0)}</p>
              </td>
              <td className="w-[14%] border-r border-black p-1 align-top">
                <p className="uppercase font-bold text-[8px] text-left">Outras Despesas</p>
                <p className="text-xs text-right">0,00</p>
              </td>
              <td className="w-[14%] border-r border-black p-1 align-top">
                <p className="uppercase font-bold text-[8px] text-left">Valor do IPI</p>
                <p className="text-xs text-right">0,00</p>
              </td>
              <td className="w-[30%] border-black p-1 align-top bg-gray-100" colSpan={2}>
                <p className="uppercase font-bold text-[8px] text-left">Valor Total da Nota</p>
                <p className="text-sm text-right font-bold">{brl(order.total)}</p>
              </td>
            </tr>
          </tbody>
        </table>

        {/* Dados dos Produtos */}
        <p className="font-bold text-[10px] mb-1 mt-4">DADOS DOS PRODUTOS / SERVIÇOS</p>
        <table className="w-full border-collapse border border-black mb-2 text-xs text-center">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-black p-1 uppercase text-[8px]">Cód. Prod.</th>
              <th className="border border-black p-1 uppercase text-[8px] text-left">Descrição dos Produtos / Serviços</th>
              <th className="border border-black p-1 uppercase text-[8px]">NCM/SH</th>
              <th className="border border-black p-1 uppercase text-[8px]">CSOSN</th>
              <th className="border border-black p-1 uppercase text-[8px]">CFOP</th>
              <th className="border border-black p-1 uppercase text-[8px]">UNID</th>
              <th className="border border-black p-1 uppercase text-[8px]">QTD</th>
              <th className="border border-black p-1 uppercase text-[8px]">V. Unit.</th>
              <th className="border border-black p-1 uppercase text-[8px]">V. Total</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item, idx) => (
              <tr key={idx}>
                <td className="border border-black p-1 text-[10px]">{item.id.substring(0,6)}</td>
                <td className="border border-black p-1 text-left text-[10px]">{item.name} {item.variant}</td>
                <td className="border border-black p-1 text-[10px]">00000000</td>
                <td className="border border-black p-1 text-[10px]">0102</td>
                <td className="border border-black p-1 text-[10px]">5102</td>
                <td className="border border-black p-1 text-[10px]">UN</td>
                <td className="border border-black p-1 text-[10px]">{item.quantity}</td>
                <td className="border border-black p-1 text-[10px]">{brl(item.price)}</td>
                <td className="border border-black p-1 text-[10px]">{brl(item.price * item.quantity)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Dados Adicionais */}
        <div className="border border-black mt-8 h-32 flex">
          <div className="w-[70%] border-r border-black p-2 align-top">
            <p className="uppercase font-bold text-[8px] mb-1">Informações Complementares</p>
            <p className="text-[10px]">
              Pedido #{order.id}<br/>
              Pagamento: {order.paymentMethod.toUpperCase()}<br/>
              DOCUMENTO SIMULADO - SEM VALIDADE FISCAL REAL.
            </p>
          </div>
          <div className="w-[30%] p-2 align-top">
            <p className="uppercase font-bold text-[8px] mb-1">Reservado ao Fisco</p>
          </div>
        </div>

      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          @page { margin: 0; size: A4 portrait; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      `}} />
    </div>
  );
}
