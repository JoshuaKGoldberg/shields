import Joi from 'joi'
import { nonNegativeInteger } from '../validators.js'
import { BaseJsonService } from '../index.js'

const crateSchema = Joi.object({
  crate: Joi.object({
    downloads: nonNegativeInteger,
    recent_downloads: nonNegativeInteger.allow(null),
    max_version: Joi.string().required(),
  }).required(),
  versions: Joi.array()
    .items(
      Joi.object({
        downloads: nonNegativeInteger,
        license: Joi.string().required().allow(null),
        rust_version: Joi.string().allow(null),
      }),
    )
    .min(1)
    .required(),
}).required()

const versionSchema = Joi.object({
  version: Joi.object({
    downloads: nonNegativeInteger,
    num: Joi.string().required(),
    license: Joi.string().required().allow(null),
    rust_version: Joi.string().allow(null),
  }).required(),
}).required()

const errorSchema = Joi.object({
  errors: Joi.array()
    .items(Joi.object({ detail: Joi.string().required() }))
    .min(1)
    .required(),
}).required()

const schema = Joi.alternatives(crateSchema, versionSchema, errorSchema)

class BaseCratesService extends BaseJsonService {
  static defaultBadgeData = { label: 'crates.io' }

  async fetch({ crate, version }) {
    const url = version
      ? `https://crates.io/api/v1/crates/${crate}/${version}`
      : `https://crates.io/api/v1/crates/${crate}?include=versions,downloads`
    return this._requestJson({ schema, url })
  }
}

const description =
  '[Crates.io](https://crates.io/) is a package registry for Rust.'

export { BaseCratesService, description }
