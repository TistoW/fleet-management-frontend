import { addIcon } from '@iconify/react'
import altArrowDownLinear from '@iconify-icons/solar/alt-arrow-down-linear'
import altArrowLeftLinear from '@iconify-icons/solar/alt-arrow-left-linear'
import altArrowRightLinear from '@iconify-icons/solar/alt-arrow-right-linear'
import busBoldDuotone from '@iconify-icons/solar/bus-bold-duotone'
import checkSquareBold from '@iconify-icons/solar/check-square-bold'
import closeCircleBold from '@iconify-icons/solar/close-circle-bold'
import dangerTriangleBold from '@iconify-icons/solar/danger-triangle-bold'
import dangerTriangleBoldDuotone from '@iconify-icons/solar/danger-triangle-bold-duotone'
import doubleAltArrowLeftLinear from '@iconify-icons/solar/double-alt-arrow-left-linear'
import doubleAltArrowRightLinear from '@iconify-icons/solar/double-alt-arrow-right-linear'
import magniferLinear from '@iconify-icons/solar/magnifer-linear'
import mapArrowRightBold from '@iconify-icons/solar/map-arrow-right-bold'
import questionCircleBold from '@iconify-icons/solar/question-circle-bold'
import refreshBold from '@iconify-icons/solar/refresh-bold'
import routing2Bold from '@iconify-icons/solar/routing-2-bold'
import stopCircleBold from '@iconify-icons/solar/stop-circle-bold'
import stopLinear from '@iconify-icons/solar/stop-linear'

// Registered up front so no icon is fetched from api.iconify.design at runtime.
const icons = {
  'solar:alt-arrow-down-linear': altArrowDownLinear,
  'solar:alt-arrow-left-linear': altArrowLeftLinear,
  'solar:alt-arrow-right-linear': altArrowRightLinear,
  'solar:bus-bold-duotone': busBoldDuotone,
  'solar:check-square-bold': checkSquareBold,
  'solar:close-circle-bold': closeCircleBold,
  'solar:danger-triangle-bold': dangerTriangleBold,
  'solar:danger-triangle-bold-duotone': dangerTriangleBoldDuotone,
  'solar:double-alt-arrow-left-linear': doubleAltArrowLeftLinear,
  'solar:double-alt-arrow-right-linear': doubleAltArrowRightLinear,
  'solar:magnifer-linear': magniferLinear,
  'solar:map-arrow-right-bold': mapArrowRightBold,
  'solar:question-circle-bold': questionCircleBold,
  'solar:refresh-bold': refreshBold,
  'solar:routing-2-bold': routing2Bold,
  'solar:stop-circle-bold': stopCircleBold,
  'solar:stop-linear': stopLinear,
}

for (const [name, data] of Object.entries(icons)) addIcon(name, data)
