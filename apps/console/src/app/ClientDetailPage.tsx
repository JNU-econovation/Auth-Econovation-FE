import { useParams } from "react-router";
import ClientDetail from "@/components/clients/ClientDetail";

/**
 * 클라이언트 상세 페이지(`/clients/:clientId`). 경로 파라미터에서 clientId를 추출해 전달합니다.
 */
const ClientDetailPage = () => {
  const { clientId = "" } = useParams<{ clientId: string }>();
  return <ClientDetail clientId={clientId} />;
};

export default ClientDetailPage;
