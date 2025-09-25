import type { ComponentPropsWithoutRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBeer,
  faChild,
  faMusic,
  faPepperHot,
} from '@fortawesome/free-solid-svg-icons';
import { faFacebookF, faInstagram } from '@fortawesome/free-brands-svg-icons';

type BaseIconProps = Omit<ComponentPropsWithoutRef<typeof FontAwesomeIcon>, 'icon'>;

export type IconProps = BaseIconProps;

export function PepperIcon(props: IconProps) {
  return <FontAwesomeIcon icon={faPepperHot} {...props} />;
}

export function MusicIcon(props: IconProps) {
  return <FontAwesomeIcon icon={faMusic} {...props} />;
}

export function KidsIcon(props: IconProps) {
  return <FontAwesomeIcon icon={faChild} {...props} />;
}

export function BeerIcon(props: IconProps) {
  return <FontAwesomeIcon icon={faBeer} {...props} />;
}

export function FacebookIcon(props: IconProps) {
  return <FontAwesomeIcon icon={faFacebookF} {...props} />;
}

export function InstagramIcon(props: IconProps) {
  return <FontAwesomeIcon icon={faInstagram} {...props} />;
}
