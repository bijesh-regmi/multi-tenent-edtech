function generateInstituteId(prefix = "INST", length = 8) {
    return Math.floor(100000 + Math.random() * 900000).toString();
}
export default generateInstituteId;
