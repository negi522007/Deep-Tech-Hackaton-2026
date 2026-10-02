import { EquipmentDetailScreen } from "@/components/screens/equipment-detail";
export default function Page({ params }: { params: { id: string } }) { return <EquipmentDetailScreen id={params.id} />; }
