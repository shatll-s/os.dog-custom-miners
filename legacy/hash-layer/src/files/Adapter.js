export default class Adapter {
    decode(response, expectedType) {
        const content = response.data?.content;
        const type = response.data?.type;
        if (!content ||
            typeof content !== "object" ||
            type !== expectedType ||
            !("fields" in content)) {
            throw new Error(`Expected type ${expectedType}, got ${content?.dataType}`);
        }
        return content;
    }
}
//# sourceMappingURL=Adapter.js.map