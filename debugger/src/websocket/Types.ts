export interface ObjectDiagram {
  objects: ODObject[];
  links: ODLink[];
  primitiveRootValues: ODPrimitiveRootValue[];
}

export interface ODObject {
  id: number;
  type: string;
  variableName: string;
  attributeValues: ODAttributeValue[];
}

export interface ODLink {
  from: string;
  to: string;
  type: string;
}

export interface ODPrimitiveRootValue {
  variableName: string;
  type: string;
  value: string;
}

export interface ODAttributeValue {
  name: string;
  type: string;
  value: string;
}
