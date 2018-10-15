import { LinkBoundMetadata } from '../decorators';
import { UrlInterpolator } from './url-interpolator';
import { Binder } from './binder';

export class LinkBinder implements Binder {
  constructor(
    private meta: LinkBoundMetadata,
    private urlInterpolator: UrlInterpolator
  ) { }

  bind(target, source): void {
    const { linkQueries, bindingName } = this.meta;
    const { links = [] } = source;
    const { href, rel = [] } =
      links.find(({ rel: rels = []}) =>
          linkQueries.some(linkQuery =>
            linkQuery.every(requiredRel => rels.includes(requiredRel))
          )
      ) || {} as any;

    if (!href) {
      return;
    }

    const hasInterpolationParameters = this.urlInterpolator.hasInterpolationParameters(href);
    const make = (parameters => hasInterpolationParameters && this.urlInterpolator.interpolate(href, parameters) || href);

    const response = { href, rel: [...rel], make };

    Object.defineProperty(target, bindingName, {
      get: () => response
    });
  }
}
