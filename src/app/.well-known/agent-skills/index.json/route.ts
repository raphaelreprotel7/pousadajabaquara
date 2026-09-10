import {
  hotelBookingSkill,
  hotelInformationSkill,
  skillDigest,
} from '@/utilities/agentSkills'
import { publicHeaders } from '@/utilities/discovery'

export const dynamic = 'force-static'

const informationDescription =
  'Consulte informações públicas, acomodações, promoções e artigos da Pousada Recanto do Jabaquara em Paraty.'
const bookingDescription =
  'Prepare uma consulta segura de disponibilidade no motor oficial de reservas da Pousada Recanto do Jabaquara.'

export function GET() {
  return Response.json(
    {
      $schema: 'https://schemas.agentskills.io/discovery/0.2.0/schema.json',
      skills: [
        {
          name: 'recanto-do-jabaquara-information',
          type: 'skill-md',
          description: informationDescription,
          url: '/.well-known/agent-skills/recanto-do-jabaquara-information/SKILL.md',
          digest: skillDigest(hotelInformationSkill),
        },
        {
          name: 'recanto-do-jabaquara-booking',
          type: 'skill-md',
          description: bookingDescription,
          url: '/.well-known/agent-skills/recanto-do-jabaquara-booking/SKILL.md',
          digest: skillDigest(hotelBookingSkill),
        },
      ],
    },
    { headers: publicHeaders('application/json; charset=utf-8') },
  )
}
