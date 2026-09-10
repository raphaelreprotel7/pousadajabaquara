import { hotelInformationSkill } from '@/utilities/agentSkills'
import { publicHeaders } from '@/utilities/discovery'

export const dynamic = 'force-static'

export function GET() {
  return new Response(hotelInformationSkill, {
    headers: publicHeaders('text/markdown; charset=utf-8'),
  })
}
