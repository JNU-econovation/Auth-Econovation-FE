import { Spacing } from "@auth-econovation/ui";
import ClientRegisterSection from "@/components/clients/ClientRegisterSection";
import ClientManageSection from "@/components/clients/ClientManageSection";

/**
 * 클라이언트 페이지: OAuth 클라이언트 등록 + 단건 조회/redirect URI 관리.
 */
const ClientsPage = () => {
  return (
    <div>
      <ClientRegisterSection />
      <Spacing size={40} />
      <ClientManageSection />
    </div>
  );
};

export default ClientsPage;
