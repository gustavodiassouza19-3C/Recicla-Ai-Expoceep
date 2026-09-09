import { Card, separator, Badge } from "@/components/ui";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";

export default function Dashboard() {
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Sample data - will be replaced with Supabase queries
  const rewards = [
    { id: 1, name: "Desconto 10%", type: "desconto", value: "R$ 10,00", date: "2024-01-15", status: "usado" },
    { id: 2, name: "Desconto 5%", type: "desconto", value: "R$ 5,00", date: "2024-01-10", status: "disponivel" },
    { id: 3, name: "Gift Card R$ 20", type: "giftcard", value: "R$ 20,00", date: "2024-01-05", status: "disponivel" },
  ];

  const recyclingHistory = [
    { id: 1, material: "Papel", weight: "2.5kg", date: "2024-01-20", reward: "R$ 5,00" },
    { id: 2, material: "Plástico", weight: "1.2kg", date: "2024-01-18", reward: "R$ 3,00" },
    { id: 3, material: "Vidro", weight: "3.0kg", date: "2024-01-15", reward: "R$ 5,00" },
  ];

  const nfcTags = [
    { id: 1, status: "disponivel", lastUsed: "2024-01-10" },
    { id: 2, status: "em-uso", lastUsed: "2024-01-15" },
    { id: 3, status: "disponivel", lastUsed: "2024-01-05" },
  ];

  return (
    <main className="flex-1 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-2xl font-bold textforeground">Painel de Controle</h1>
          <p className="text-muted-foreground mt-1">Bem-vindo de volta, cidadão!</p>
        </header>

        {/* Rewards Balance */}
        <Card className="mb-6">
          <h2 className="text-lg font-medium mb-4">Saldo de Recompensas</h2>
          <div className="grid grid-cols-2 gap-4">
            {rewards.map((reward) => (
              <Card key={reward.id} className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{reward.name}</p>
                    <p className="text-sm text-muted-foreground">{reward.type}</p>
                  </div>
                  <Badge>{reward.value}</Badge>
                </div>
              </Card>
            ))}
          </div>
        </Card>

        {/* Recycling History */}
        <Card>
          <h2 className="text-lg font-medium mb-4">Histórico de Reciclagem</h2>
          {recyclingHistory.length === 0 ? (
            <p className="text-muted-foreground">Nenhuma reciclagem registrada.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recyclingHistory.map((item) => (
                <Card key={item.id} className="p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{item.material}</p>
                      <p className="text-xs text-muted-foreground">{item.date}</p>
                    </div>
                    <span className="text-sm">{item.reward}</span>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </Card>

        {/* NFC Tags */}
        <Card>
          <h2 className="text-lg font-medium mb-4">Tags NFC</h2>
          {nfcTags.length === 0 ? (
            <p className="text-muted-foreground">Nenhuma tag vinculada.</p>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {nfcTags.map((tag) => (
                <Card key={tag.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <span>Tag #{tag.id}</span>
                    <Badge>{tag.status}</Badge>
                  </div>
                </Card>
              ))}
            </div>
          )}
          <Button
            onClick={() => setIsModalOpen(true)}
            className="mt-4 w-full"
          >
            Vincular Nova Tag
          </Button>
        </Card>

        {/* Modal for adding new tag */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
            <Card className="p-6 w-full max-w-md">
              <h2 className="text-xl font-medium mb-4">Vincular Nova Tag</h2>
              <Input
                placeholder="Digite o código da tag NFC"
                className="mb-4"
              />
              <div className="flex gap-3">
                <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={() => setIsModalOpen(false)}>
                  Vincular
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </main>
  );
}