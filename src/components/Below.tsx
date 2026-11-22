import { useEffect } from 'react'
import { Crate } from './Crate'
import { Manifesto } from './Manifesto'
import { Tracklist } from './Tracklist'
import { Rsvp } from './Rsvp'
import { Band, Clock, Footer } from './Sections'

/* tudo abaixo da dobra: chunk separado, o disco não espera por ele */
export default function Below() {
  // link com âncora (#lista, #lineup) chega antes deste chunk: rola quando ele monta
  useEffect(() => {
    const id = location.hash.slice(1)
    if (id) document.getElementById(id)?.scrollIntoView()
  }, [])
  return (
    <>
      <Band />
      <Crate />
      <Manifesto />
      <Tracklist />
      <Clock />
      <Rsvp />
      <Footer />
    </>
  )
}
