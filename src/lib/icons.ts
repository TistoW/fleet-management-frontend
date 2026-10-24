import { addIcon } from '@iconify/react'
import altArrowDownLinear from '@iconify-icons/solar/alt-arrow-down-linear'
import altArrowLeftLinear from '@iconify-icons/solar/alt-arrow-left-linear'
import altArrowRightLinear from '@iconify-icons/solar/alt-arrow-right-linear'
import busBold from '@iconify-icons/solar/bus-bold'
import busBoldDuotone from '@iconify-icons/solar/bus-bold-duotone'
import checkSquareBold from '@iconify-icons/solar/check-square-bold'
import closeCircleBold from '@iconify-icons/solar/close-circle-bold'
import dangerTriangleBold from '@iconify-icons/solar/danger-triangle-bold'
import dangerTriangleBoldDuotone from '@iconify-icons/solar/danger-triangle-bold-duotone'
import doubleAltArrowLeftLinear from '@iconify-icons/solar/double-alt-arrow-left-linear'
import doubleAltArrowRightLinear from '@iconify-icons/solar/double-alt-arrow-right-linear'
import flagBold from '@iconify-icons/solar/flag-bold'
import hamburgerMenuBold from '@iconify-icons/solar/hamburger-menu-bold'
import infoCircleBold from '@iconify-icons/solar/info-circle-bold'
import magniferLinear from '@iconify-icons/solar/magnifer-linear'
import mapBold from '@iconify-icons/solar/map-bold'
import mapArrowRightBold from '@iconify-icons/solar/map-arrow-right-bold'
import questionCircleBold from '@iconify-icons/solar/question-circle-bold'
import refreshBold from '@iconify-icons/solar/refresh-bold'
import routing2Bold from '@iconify-icons/solar/routing-2-bold'
import stopCircleBold from '@iconify-icons/solar/stop-circle-bold'
import stopLinear from '@iconify-icons/solar/stop-linear'
import busLinear from '@iconify-icons/solar/bus-linear'
import mapPointWaveLinear from '@iconify-icons/solar/map-point-wave-linear'
import databaseLinear from '@iconify-icons/solar/database-linear'
import closeCircleLinear from '@iconify-icons/solar/close-circle-linear'
import hamburgerMenuLinear from '@iconify-icons/solar/hamburger-menu-linear'
import refreshLinear from '@iconify-icons/solar/refresh-linear'
import dangerTriangleLinear from '@iconify-icons/solar/danger-triangle-linear'
import routing2Linear from '@iconify-icons/solar/routing-2-linear'
import mapArrowRightLinear from '@iconify-icons/solar/map-arrow-right-linear'
import checkSquareLinear from '@iconify-icons/solar/check-square-linear'
import stopCircleLinear from '@iconify-icons/solar/stop-circle-linear'
import questionCircleLinear from '@iconify-icons/solar/question-circle-linear'
import filterLinear from '@iconify-icons/solar/filter-linear'
import menuDotsBold from '@iconify-icons/solar/menu-dots-bold'
import arrowLeftLinear from '@iconify-icons/solar/arrow-left-linear'
import bugLinear from '@iconify-icons/solar/bug-linear'
import wiFiCrossLinear from '@iconify-icons/solar/wi-fi-cross-linear'
import wiFiLowLinear from '@iconify-icons/solar/wi-fi-low-linear'
import hourglassLinear from '@iconify-icons/solar/hourglass-linear'
import serverLinear from '@iconify-icons/solar/server-linear'
import forbiddenCircleLinear from '@iconify-icons/solar/forbidden-circle-linear'
import inboxLinear from '@iconify-icons/solar/inbox-linear'
import mapPointRemoveLinear from '@iconify-icons/solar/map-point-remove-linear'

// Registered up front so no icon is fetched from api.iconify.design at runtime.
const icons = {
  'solar:alt-arrow-down-linear': altArrowDownLinear,
  'solar:alt-arrow-left-linear': altArrowLeftLinear,
  'solar:alt-arrow-right-linear': altArrowRightLinear,
  'solar:bus-bold': busBold,
  'solar:flag-bold': flagBold,
  'solar:bus-bold-duotone': busBoldDuotone,
  'solar:check-square-bold': checkSquareBold,
  'solar:close-circle-bold': closeCircleBold,
  'solar:danger-triangle-bold': dangerTriangleBold,
  'solar:danger-triangle-bold-duotone': dangerTriangleBoldDuotone,
  'solar:double-alt-arrow-left-linear': doubleAltArrowLeftLinear,
  'solar:double-alt-arrow-right-linear': doubleAltArrowRightLinear,
  'solar:hamburger-menu-bold': hamburgerMenuBold,
  'solar:info-circle-bold': infoCircleBold,
  'solar:magnifer-linear': magniferLinear,
  'solar:map-bold': mapBold,
  'solar:map-arrow-right-bold': mapArrowRightBold,
  'solar:question-circle-bold': questionCircleBold,
  'solar:refresh-bold': refreshBold,
  'solar:routing-2-bold': routing2Bold,
  'solar:stop-circle-bold': stopCircleBold,
  'solar:stop-linear': stopLinear,
  'solar:bus-linear': busLinear,
  'solar:map-point-wave-linear': mapPointWaveLinear,
  'solar:database-linear': databaseLinear,
  'solar:close-circle-linear': closeCircleLinear,
  'solar:hamburger-menu-linear': hamburgerMenuLinear,
  'solar:refresh-linear': refreshLinear,
  'solar:danger-triangle-linear': dangerTriangleLinear,
  'solar:routing-2-linear': routing2Linear,
  'solar:map-arrow-right-linear': mapArrowRightLinear,
  'solar:check-square-linear': checkSquareLinear,
  'solar:stop-circle-linear': stopCircleLinear,
  'solar:question-circle-linear': questionCircleLinear,
  'solar:filter-linear': filterLinear,
  'solar:menu-dots-bold': menuDotsBold,
  'solar:arrow-left-linear': arrowLeftLinear,
  'solar:bug-linear': bugLinear,
  'solar:wi-fi-cross-linear': wiFiCrossLinear,
  'solar:wi-fi-low-linear': wiFiLowLinear,
  'solar:hourglass-linear': hourglassLinear,
  'solar:server-linear': serverLinear,
  'solar:forbidden-circle-linear': forbiddenCircleLinear,
  'solar:inbox-linear': inboxLinear,
  'solar:map-point-remove-linear': mapPointRemoveLinear,
}

for (const [name, data] of Object.entries(icons)) addIcon(name, data)
