/**
 * @type {{hide_icons: boolean, rename_map: Record<string, string>}}
 */
export const default_settings = {
  "hide_icons": false,
  "rename_map": {
    "AWS Organizations": "Org",
    "IAM Identity Center": "SSO",
    "CloudTrail": "CTr",
    "CloudWatch": "CW",
    "Systems Manager": "SSM",
    "Secrets Manager": "Secret",
    "CloudFormation": "CFn",
    "Route 53": "DNS",
    "CloudFront": "CFr",
    "Certificate Manager": "ACM",
    "Key Management Service": "KMS",
    "API Gateway": "API",
    "Elastic Container Registry": "ECR",
    "Elastic Container Service": "ECS",
    "Lambda": "λ",
    "DynamoDB": "DDB",
    "ElastiCache": "Cache",
    "Amazon EventBridge": "Event",
    "Simple Notification Service": "SNS",
    "Simple Queue Service": "SQS",
    "Step Functions": "Step",
    "AWS Glue": "Glue",
    "AWS Cost Explorer": "Cost",
  },
};

/**
 * @param {Object} options
 * @returns {{valid: boolean, errors: string[]}}
 */
export function validateOptions (options) {
  /** @type string[] */
  let errors = [];

  if (typeof options.hide_icons !== "boolean") {
    errors.push("ERROR: hide_icons option is not boolean");
  }

  if (typeof options.rename_map !== "object") {
    errors.push("ERROR: rename_map option is not object");
    return { valid: false, errors: errors };
  }

  let names = new Set(Object.keys(options.rename_map));
  for (const [src, dst] of Object.entries(options.rename_map)) {
    if (typeof dst !== "string") {
      errors.push(`ERROR: destination name must be a string: ${dst}`);
      continue;
    }

    if (src === dst) {
      errors.push(`ERROR: destination name must not be same to source name: ${src}`);
    }

    if (names.has(dst)) {
      errors.push(`ERROR: destination name duplication in "${src}": ${dst}`);
    }

    names.add(dst);
  }

  return { valid: errors.length === 0, errors: errors };
}

/**
 * @return {Promise<{[k: string]: any}>}
 */
export async function loadOptions () {
  let options = await chrome.storage.local.get();

  // Load default when storage is empty
  if (!Object.keys(options).length) {
    console.log("loaded default options", default_settings);
    return default_settings;
  }

  console.log("loaded saved options", options);
  return options;
}

/**
 * @param {Object} options
 * @return Promise<void>
 */
export async function saveOptions (options) {
  await chrome.storage.local.set(options);
}
