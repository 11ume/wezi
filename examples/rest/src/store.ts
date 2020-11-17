import Bear from 'bear'

const bears: Map<string, Bear> = new Map()

bears.set('1', {
    id: '1'
    , type: 'Polar'
    , location: 'North Pole'
})

bears.set('2', {
    id: '2'
    , type: 'Grizzly'
    , location: 'Yellowstone National Park'
})

export default bears
