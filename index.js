import {drawBox, prompt} from "./helpers.js";
import federationClient from '@sphereon/openid-federation-client'
const { FederationClient } = federationClient
const client = new FederationClient(null, null)

// This is the Trust Anchor for the Italian OpenID Federation
// The Italian Ministry of Interior (Ministero dell'Interno) operates this trust anchor
// It serves as the root of trust for the entire Italian public administration federation
// All participating entities must establish a chain of trust back to this anchor directly or via intermediates
const TRUST_ANCHOR_IDENTIFIER = "https://oidc.registry.servizicie.interno.gov.it"

// This is the municipality of Acerenza, Italy
// It represents the local government that participates in the federation
const ENTITY_IDENTIFIER = "https://accessoacerenza.wemapp.eu"

const run = async () => {
    // This client function attempts to discover and build a trust chain from the entity to a trust anchor
    // It will traverse the federation, following entity statements and subordinate relationships
    // The function stops when it finds the first valid path to any of the provided trust anchors
    const resolution = await client.resolveTrustChain(ENTITY_IDENTIFIER, [TRUST_ANCHOR_IDENTIFIER])

    if (resolution.error) {
        throw resolution.errorMessage
    }

    let lines = [
        `Chain Length: ${resolution.trustChain.length}`,
        `Entity: ${ENTITY_IDENTIFIER}`,
        `Trust Anchor: ${TRUST_ANCHOR_IDENTIFIER}`
    ];

    drawBox('Trust Chain Information', lines, Math.max(...lines.map(line => line.length)) + 8);

    // Now we'll verify the trust chain we resolved above
    // The verifyTrustChain function takes three optional parameters:
    // 1. trustChain: The chain of entity statements to verify (required)
    // 2. trustAnchor: Optional - If provided, verifies the chain ends at this specific anchor
    //                           If not provided, just verifies the last entity is a valid trust anchor
    // 3. currentTime: Optional - Reference time for validating exp/iat claims
    //                           If not provided, uses current system time
    const verification = await client.verifyTrustChain(resolution.trustChain, null, null)

    lines = [
        `Verification Status: ${verification.isValid ? '✅ Valid' : '❌ Invalid'}`
    ];
    const verificationWidth = Math.max(...lines.map(line => line.length)) + 8;
    drawBox('Trust Chain Verification', lines, verificationWidth);

    // Now we'll verify a trust mark issued to the same entity
    // Trust marks are signed statements that assert specific properties or qualifications
    // In this case, we'll verify a trust mark issued by the Italian Trust Anchor
    await prompt('Press Enter to proceed with trust mark verification...')

    // First, we need to fetch the Trust Anchor's entity configuration statement
    // This statement contains the Trust Anchor's public keys and other metadata
    // We'll use this configuration to verify the signature on the trust mark JWT
    const trustAnchorConfigurationStatement = await client.entityConfigurationStatementGet(TRUST_ANCHOR_IDENTIFIER)

    // The verifyTrustMark function will:
    // 1. Take the trust mark to be verified JWT as first parameter
    // 2. Use the Trust Anchor's configuration to perform validation
    // 3. Return a boolean indicating if the trust mark is valid
    const isValidTrustMark = await client.verifyTrustMark(
        "eyJraWQiOiJkZWZhdWx0UlNBU2lnbiIsInR5cCI6InRydXN0LW1hcmsrand0IiwiYWxnIjoiUlMyNTYifQ.eyJzdWIiOiJodHRwczovL2FjY2Vzc29hY2VyZW56YS53ZW1hcHAuZXUiLCJpc3MiOiJodHRwczovL29pZGMucmVnaXN0cnkuc2Vydml6aWNpZS5pbnRlcm5vLmdvdi5pdCIsIm9yZ2FuaXphdGlvbl90eXBlIjoicHVibGljIiwiaWQiOiJodHRwczovL29pZGMucmVnaXN0cnkuc2Vydml6aWNpZS5pbnRlcm5vLmdvdi5pdC9vcGVuaWRfcmVseWluZ19wYXJ0eS9wdWJsaWMiLCJleHAiOjE3NTA4NDI5NjAsImlhdCI6MTcxOTMwNjk2MH0.eBIoDQl9lwH6KPvy1pPa_UudwTQpQVNWtG82vLUXCKnpdHwDJc7o1w-KSIzhLpBikeguBq64ZYRhRcTCXB8IHd2T0sBss371qfwGD9wfAJuDxmDC2qu0DPc7ZghIO2Gchs1a6P8CB3PnnJLuJKnJKxJyIGgni9ScEN27uvoLxjOSWseID7k2hnXnM3i4wooZurtvTHsXZ9me3PCWely0Kk7bM5YgqnxK6VustK7vAw3TisGL73G6CUhj-89TwUAOmTIu7-BF2vJNwYsUhN4_JzL8hCVLS2VBZ_LecA23avtD1gSb2whVF6__lpm1Now8jDoTbvLerHfEsZnu4FvgbQ",
        trustAnchorConfigurationStatement
    )

    lines = [
        `Trust Mark Status: ${isValidTrustMark ? '✅ Valid' : '❌ Invalid'}`
    ];
    const trustMarkWidth = Math.max(...lines.map(line => line.length)) + 8;
    drawBox('Trust Mark Verification', lines, trustMarkWidth);
}

await run()
