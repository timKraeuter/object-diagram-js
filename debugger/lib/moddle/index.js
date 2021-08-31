
import {
  assign
} from 'min-dash';

import Moddle from './Moddle';

import DBDescriptors from './resources/db.json';
import ODDescriptors from './resources/od.json';
import DiDescriptors from './resources/odDi.json';
import DcDescriptors from './resources/dc.json';

var packages = {
  od: ODDescriptors,
  odDi: DiDescriptors,
  dc: DcDescriptors,
  db: DBDescriptors,
};

export default function(additionalPackages, options) {
  var pks = assign({}, packages, additionalPackages);

  return new Moddle(pks, options);
}
