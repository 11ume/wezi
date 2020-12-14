type Bear = {
    id: string
    type: string
    location: string
}

export type BearId = Pick<Bear, 'id'>
export default Bear
