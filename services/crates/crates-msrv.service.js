import { NotFound, pathParams } from '../index.js'
import {
  BaseCratesService,
  description as cratesIoDescription,
} from './crates-base.js'

const description = `
${cratesIoDescription}

MSRV is a crate's minimum suppported rust version,
the oldest version of Rust supported by the crate.
See the [Cargo Book](https://doc.rust-lang.org/cargo/reference/manifest.html#the-rust-version-field)
for more info.
`

export default class CratesMSRV extends BaseCratesService {
  static category = 'platform-support'
  static route = {
    base: 'crates/msrv',
    pattern: ':crate/:version?',
  }

  static openApi = {
    '/crates/msrv/{crate}': {
      get: {
        summary: 'Crates.io MSRV',
        description,
        parameters: pathParams({
          name: 'crate',
          example: 'serde',
        }),
      },
    },
    '/crates/msrv/{crate}/{version}': {
      get: {
        summary: 'Crates.io MSRV (version)',
        description,
        parameters: pathParams(
          {
            name: 'crate',
            example: 'serde',
          },
          {
            name: 'version',
            example: '1.0.194',
          },
        ),
      },
    },
  }

  static defaultBadgeData = { label: 'msrv', color: 'blue' }

  static transform({ errors, version, versions }) {
    // crates.io returns a 200 response with an errors object in
    // error scenarios, e.g. https://crates.io/api/v1/crates/libc/0.1
    if (errors) {
      throw new NotFound({ prettyMessage: errors[0].detail })
    }

    const msrv = version ? version.rust_version : versions[0].rust_version
    if (!msrv) {
      throw new NotFound({ prettyMessage: 'unknown' })
    }

    return { msrv }
  }

  async handle({ crate, version }) {
    const json = await this.fetch({ crate, version })
    const { msrv } = this.constructor.transform(json)
    return { message: msrv }
  }
}
