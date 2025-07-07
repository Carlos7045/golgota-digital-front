
import { User, ChannelType } from '@/pages/Community';
import GeneralChannel from './channels/GeneralChannel';
import TrainingsChannel from './channels/TrainingsChannel';
import CampsChannel from './channels/CampsChannel';
import CampaignsChannel from './channels/CampaignsChannel';
import TeachLearnChannel from './channels/TeachLearnChannel';
import EventsChannel from './channels/EventsChannel';
import FinancialChannel from './channels/FinancialChannel';
import OpportunitiesChannel from './channels/OpportunitiesChannel';
import CompanyPanelChannel from './channels/CompanyPanelChannel';

interface ChannelContentProps {
  user: User;
  channel: ChannelType;
}

const ChannelContent = ({ user, channel }: ChannelContentProps) => {
  switch (channel) {
    case 'geral':
      return <GeneralChannel user={user} />;
    case 'treinamentos':
      return <TrainingsChannel user={user} />;
    case 'acampamentos':
      return <CampsChannel user={user} />;
    case 'campanhas':
      return <CampaignsChannel user={user} />;
    case 'ensine-aprenda':
      return <TeachLearnChannel user={user} />;
    case 'eventos':
      return <EventsChannel user={user} />;
    case 'financeiro':
      return <FinancialChannel />;
    case 'oportunidades':
      return <OpportunitiesChannel user={user} />;
    case 'painel-cia':
      return <CompanyPanelChannel user={user} />;
    default:
      return <GeneralChannel user={user} />;
  }
};

export default ChannelContent;
