import React from 'react'
import {ComponentPreview, Previews} from '@react-buddy/ide-toolbox'
import {PaletteTree} from './palette'
import StickyNotesBoard from "../App";

const ComponentPreviews = () => {
    return (
        <Previews palette={<PaletteTree/>}>
            <ComponentPreview path="/StickyNotesBoard">
                <StickyNotesBoard/>
            </ComponentPreview>
        </Previews>
    )
}

export default ComponentPreviews