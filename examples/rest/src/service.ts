import wezi from 'wezi'
import router from 'wezi-router'
import bearsRoutes from 'api/bears/routes'

const r = router('/api')
const w = wezi(r(bearsRoutes))
export default w

