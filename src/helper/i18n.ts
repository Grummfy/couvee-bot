import i18n_en from '../lang/en'
import i18n_fr from '../lang/fr'
import * as _ from 'lodash'

let i18n = {
    en: i18n_en,
    fr: i18n_fr,
}

export default _.defaultsDeep(i18n[ process.env.LANG ], i18n_en)
