import UserSettings from '~/interfaces/UserSettings'
import Postings from '~/interfaces/Postings'
import Dictionary from '~/interfaces/Dictionary'

export default interface InvertResult {
  dictionary: Dictionary,
  postings: Postings,
  settings: UserSettings
}
