import { Scheme } from '../../models/Scheme';
import { User } from '../../models/User';

export class SchemeService {
  static async getSchemes(filters: any) {
    const page = parseInt(filters.page || '1');
    const limit = parseInt(filters.limit || '10');
    const skip = (page - 1) * limit;

    const query: any = {  };
    if (filters.search) {
      query.title = { $regex: filters.search, $options: 'i' };
    }
    if (filters.category) {
      query.category = filters.category;
    }
    if (filters.state) {
      query.state = filters.state;
    }

    // Only active schemes by default
    query.isActive = true;

    const [schemes, total] = await Promise.all([
      Scheme.find(query).sort({ title: 1 }).skip(skip).limit(limit).lean(),
      Scheme.countDocuments(query),
    ]);

    return {
      schemes,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      }
    };
  }

  static async getSchemeBySlug(slug: string) {
    const scheme = await Scheme.findOne({ slug }).lean();
    if (!scheme) throw { statusCode: 404, message: 'Scheme not found' };
    return scheme;
  }

  static async matchEligibility(userId: string, data: { age: number; income: number; gender: string; state: string; occupation: string }) {
    await User.findByIdAndUpdate(userId, {
      age: data.age,
      income: data.income,
      gender: data.gender,
      state: data.state,
      occupation: data.occupation,
    });

    const schemes = await Scheme.find({ isActive: true }).lean();

    return schemes.filter((scheme: any) => {
      if (scheme.minAge != null && data.age < scheme.minAge) return false;
      if (scheme.maxAge != null && data.age > scheme.maxAge) return false;
      if (scheme.maxIncome != null && data.income > scheme.maxIncome) return false;
      if (scheme.gender && scheme.gender !== 'ALL' && scheme.gender !== data.gender) return false;
      if (scheme.state && scheme.state !== data.state) return false;
      if (scheme.occupation && scheme.occupation !== data.occupation) return false;
      return true;
    });
  }

  static async createScheme(data: any) {
    const slugify = (text: string) => {
      return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
    };

    let slug = slugify(data.title);
    const existing = await Scheme.findOne({ slug }).lean();
    if (existing) {
      slug = `${slug}-${Math.floor(1000 + Math.random() * 9000)}`;
    }

    const created = await Scheme.create({ ...data, slug });
    return created.toObject();
  }

  static async updateScheme(id: string, data: any) {
    const scheme = await Scheme.findById(id);
    if (!scheme) throw { statusCode: 404, message: 'Scheme not found' };

    let slug = scheme.slug;
    if (data.title && data.title !== scheme.title) {
      const slugify = (text: string) => {
        return text
          .toString()
          .toLowerCase()
          .trim()
          .replace(/\s+/g, '-')
          .replace(/[^\w\-]+/g, '')
          .replace(/\-\-+/g, '-')
          .replace(/^-+/, '')
          .replace(/-+$/, '');
      };
      slug = slugify(data.title);
      const existing = await Scheme.findOne({ slug }).lean();
      if (existing && existing._id.toString() !== id) {
        slug = `${slug}-${Math.floor(1000 + Math.random() * 9000)}`;
      }
    }

    Object.assign(scheme, { ...data, slug });
    await scheme.save();
    return scheme.toObject();
  }

  static async deleteScheme(id: string) {
    const scheme = await Scheme.findById(id);
    if (!scheme) throw { statusCode: 404, message: 'Scheme not found' };

    await Scheme.deleteOne({ _id: id });
    return { success: true };
  }
}

