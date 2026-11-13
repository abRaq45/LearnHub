
import api from "./api";

const downloadCertificate = async (courseId) => {
    const response = await api.get(
        `/certificates/courses/${courseId}/download`,
        {
            responseType: "blob"
        }
    );

    return response.data;
};

const certificateService = {
    downloadCertificate
};

export default certificateService;
