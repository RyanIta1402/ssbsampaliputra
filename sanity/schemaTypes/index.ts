import { type SchemaTypeDefinition } from 'sanity'

import {blockContentType} from './blockContentType'
import {categoryType} from './categoryType'
import {postType} from './postType'
import {authorType} from './authorType'
import {visitorCount} from './visitorCount'
import {siteSettings} from './siteSettings'
import {hero} from './hero'
import {about} from './about'
import {program} from './program'
import {coach} from './coach'
import {galleryItem} from './galleryItem'
import {achievement} from './achievement'
import {testimonial} from './testimonial'
import {pendaftaran} from './pendaftaran'
import {pengumuman} from './pengumuman'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    blockContentType,
    categoryType,
    postType,
    authorType,
    visitorCount,
    siteSettings,
    hero,
    about,
    program,
    coach,
    galleryItem,
    achievement,
    testimonial,
    pendaftaran,
    pengumuman,
  ],
}
